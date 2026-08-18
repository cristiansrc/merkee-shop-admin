import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchOrders, fetchOrderById, clearSelectedOrder } from '../../store/ordersSlice';

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'success',
  PAYMENT_FAILED: 'error',
  PAYMENT_EXPIRED: 'error',
  RESERVATION_EXPIRED: 'error',
  PAYMENT_REFUND_PENDING: 'info',
  PAYMENT_REFUNDED: 'info',
  PAYMENT_REFUND_FAILED: 'error',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagado',
  PAYMENT_FAILED: 'Pago fallido',
  PAYMENT_EXPIRED: 'Pago expirado',
  RESERVATION_EXPIRED: 'Reserva expirada',
  PAYMENT_REFUND_PENDING: 'Reembolso pendiente',
  PAYMENT_REFUNDED: 'Reembolsado',
  PAYMENT_REFUND_FAILED: 'Reembolso fallido',
};

const ALL_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PAYMENT_FAILED',
  'PAYMENT_EXPIRED',
  'RESERVATION_EXPIRED',
  'PAYMENT_REFUND_PENDING',
  'PAYMENT_REFUNDED',
  'PAYMENT_REFUND_FAILED',
];

export const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, page, loading, error, selectedOrder } = useSelector((state: RootState) => state.orders);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, size: rowsPerPage, status: statusFilter || undefined }));
  }, [dispatch, statusFilter, rowsPerPage]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(fetchOrders({ page: newPage + 1, size: rowsPerPage, status: statusFilter || undefined }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    dispatch(fetchOrders({ page: 1, size: newSize, status: statusFilter || undefined }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleViewOrder = (orderId: string) => {
    dispatch(fetchOrderById(orderId));
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    dispatch(clearSelectedOrder());
  };

  if (loading && items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Órdenes
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Órdenes</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Consulta de pedidos de clientes (solo lectura). Los estados reflejan el ciclo de vida del pago y la reserva.
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filtrar por estado</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Filtrar por estado"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos los estados</em>
              </MenuItem>
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {statusLabels[s] || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay órdenes registradas
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Ciudad</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {order.order_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.delivery_recipient_name}</TableCell>
                    <TableCell>{order.delivery_city}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[order.status] || order.status}
                        color={statusColors[order.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 'medium' }}>{formatCOP(order.total_cop)}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewOrder(order.id)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {page && (
            <TablePagination
              component="div"
              count={page.total}
              page={page.page - 1}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          )}
        </>
      )}

      {/* Dialog de detalle */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle de Orden - {selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={statusLabels[selectedOrder.status] || selectedOrder.status}
                    color={statusColors[selectedOrder.status] || 'default'}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de creación
                  </Typography>
                  <Typography>
                    {new Date(selectedOrder.created_at).toLocaleString('es-CO')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Datos de entrega
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.delivery_recipient_name} - {selectedOrder.delivery_phone}
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.delivery_line1}, {selectedOrder.delivery_city}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Items
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio Unitario</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                            <TableCell align="right">{formatCOP(item.unit_price_cop)}</TableCell>
                            <TableCell align="right">{formatCOP(item.subtotal_cop)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Resumen de pago
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCOP(selectedOrder.items_subtotal_cop)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Envío:</Typography>
                    <Typography>{formatCOP(selectedOrder.delivery_fee_cop)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>IVA (19%):</Typography>
                    <Typography>{formatCOP(selectedOrder.iva_cop)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatCOP(selectedOrder.total_cop)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pago
                  </Typography>
                  <Typography variant="body2">
                    Proveedor: {selectedOrder.payment.provider} | Estado: {selectedOrder.payment.status}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;