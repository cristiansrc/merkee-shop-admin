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
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchProducts } from '../../store/productsSlice';
import { createStockAdjustment, clearStockError, clearLastAdjustment } from '../../store/stockSlice';

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

export const StockPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.products);
  const { loading: stockLoading, error: stockError, lastAdjustment } = useSelector(
    (state: RootState) => state.stock
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustment, setAdjustment] = useState({ quantity_delta: 0, reason: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, size: 100 }));
  }, [dispatch]);

  const handleAdjustClick = (product: any) => {
    setSelectedProduct(product);
    setAdjustment({ quantity_delta: 0, reason: '' });
    setOpenDialog(true);
  };

  const handleAdjustSubmit = async () => {
    if (!selectedProduct || !adjustment.reason || adjustment.quantity_delta === 0) return;

    const result = await dispatch(
      createStockAdjustment({
        productId: selectedProduct.id,
        data: {
          quantity_delta: adjustment.quantity_delta,
          reason: adjustment.reason,
        },
      })
    );

    if (createStockAdjustment.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: `Ajuste de ${adjustment.quantity_delta > 0 ? '+' : ''}${adjustment.quantity_delta} registrado para ${selectedProduct.name}`,
        severity: 'success',
      });
      setOpenDialog(false);
      // Refresh products to get updated stock
      dispatch(fetchProducts({ page: 1, size: 100 }));
    } else {
      setSnackbar({
        open: true,
        message: result.payload as string || 'Error al ajustar stock',
        severity: 'error',
      });
    }
  };

  const handleCloseDialog = () => {
    if (!stockLoading) {
      setOpenDialog(false);
      setSelectedProduct(null);
      dispatch(clearStockError());
    }
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
          Gestión de Stock
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
        <Typography variant="h4">Gestión de Stock</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Ajuste manual de inventario para productos. Los ajustes son auditados e idempotentes.
          Use la clave de idempotencia para reintentos seguros.
        </Typography>
      </Paper>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay productos para gestionar stock
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Stock Disponible</TableCell>
                <TableCell align="right">Stock Reservado</TableCell>
                <TableCell align="right">Stock Total</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt_text}
                        variant="rounded"
                        sx={{ width: 40, height: 30 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category.name} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={product.stock_available}
                      color={product.stock_available > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">0</TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 'medium' }}>{product.stock_available}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleAdjustClick(product)}
                    >
                      Ajustar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de ajuste */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ajustar Stock - {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          {stockError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {stockError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Cantidad (positivo para agregar, negativo para quitar)"
            type="number"
            value={adjustment.quantity_delta}
            onChange={(e) => setAdjustment({ ...adjustment, quantity_delta: parseInt(e.target.value) || 0 })}
            margin="normal"
            disabled={stockLoading}
            helperText="Use números positivos para agregar stock y negativos para quitar"
          />
          <TextField
            fullWidth
            label="Razón del ajuste"
            value={adjustment.reason}
            onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            required
            disabled={stockLoading}
            helperText="Mínimo 3 caracteres. Esta razón quedará registrada en la auditoría."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={stockLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdjustSubmit}
            variant="contained"
            disabled={stockLoading || !adjustment.reason || adjustment.reason.length < 3 || adjustment.quantity_delta === 0}
          >
            {stockLoading ? 'Aplicando...' : 'Aplicar Ajuste'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockPage;
