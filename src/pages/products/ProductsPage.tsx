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
  TablePagination,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { fetchProducts, createProduct, updateProduct, deleteProduct, clearProductOperationError } from '../../store/productsSlice';
import { fetchCategories } from '../../store/categoriesSlice';
import { ProductFormDialog } from '../../components/ProductFormDialog';
import type { ProductResponse } from '../../types/api';

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

export const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, page, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.products
  );
  const { items: categories } = useSelector((state: RootState) => state.categories);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, size: 20 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(fetchProducts({ page: newPage + 1, size: 20 }));
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductResponse) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const result = await dispatch(deleteProduct(deleteConfirm));
    if (deleteProduct.fulfilled.match(result)) {
      setSnackbar({ open: true, message: 'Producto eliminado exitosamente', severity: 'success' });
    } else {
      setSnackbar({
        open: true,
        message: result.payload as string || 'Error al eliminar producto',
        severity: 'error',
      });
    }
    setDeleteConfirm(null);
  };

  const handleFormSubmit = async (data: any, version?: number) => {
    let result;
    if (selectedProduct && version !== undefined) {
      result = await dispatch(updateProduct({ id: selectedProduct.id, data, version }));
    } else {
      result = await dispatch(createProduct(data));
    }

    if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: selectedProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
        severity: 'success',
      });
      setDialogOpen(false);
      setSelectedProduct(null);
      // Refresh list
      dispatch(fetchProducts({ page: page?.page || 1, size: page?.size || 20 }));
    }
  };

  const handleDialogClose = () => {
    if (!operationLoading) {
      setDialogOpen(false);
      setSelectedProduct(null);
      dispatch(clearProductOperationError());
    }
  };

  const filteredItems = items.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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
          Productos
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
        <Typography variant="h4">Productos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Producto
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          size="small"
        />
      </Paper>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay productos registrados
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell align="right">Precio Regular</TableCell>
                  <TableCell align="right">Precio Descuento</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Versión</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt_text}
                        variant="rounded"
                        sx={{ width: 60, height: 45 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category.name} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatCOP(product.regular_price_cop)}</TableCell>
                    <TableCell align="right">
                      {product.sale_price_cop < product.regular_price_cop ? (
                        <Typography color="success.main" sx={{ fontWeight: 'medium' }}>
                          {formatCOP(product.sale_price_cop)}
                        </Typography>
                      ) : (
                        formatCOP(product.sale_price_cop)
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.stock_available}
                        size="small"
                        color={product.stock_available > 0 ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={`v${product.version}`} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(product)}
                        disabled={operationLoading}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id)}
                        disabled={operationLoading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
              rowsPerPage={page.size}
              onPageChange={handlePageChange}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          )}
        </>
      )}

      {/* Form Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        categories={categories}
        loading={operationLoading}
        error={operationError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} disabled={operationLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={operationLoading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for operation feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;
