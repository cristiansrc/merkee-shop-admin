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
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearOperationError,
} from '../../store/categoriesSlice';
import { CategoryFormDialog } from '../../components/CategoryFormDialog';
import type { CategoryResponse } from '../../types/api';

export const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.categories
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const result = await dispatch(deleteCategory(deleteConfirm));
    if (deleteCategory.fulfilled.match(result)) {
      setSnackbar({ open: true, message: 'Categoría eliminada exitosamente', severity: 'success' });
    } else {
      setSnackbar({
        open: true,
        message: result.payload as string || 'Error al eliminar categoría',
        severity: 'error',
      });
    }
    setDeleteConfirm(null);
  };

  const handleFormSubmit = async (data: { name: string; image_key: string }, version?: number) => {
    let result;
    if (selectedCategory && version !== undefined) {
      result = await dispatch(updateCategory({ id: selectedCategory.id, data, version }));
    } else {
      result = await dispatch(createCategory(data));
    }

    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: selectedCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente',
        severity: 'success',
      });
      setDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleDialogClose = () => {
    if (!operationLoading) {
      setDialogOpen(false);
      setSelectedCategory(null);
      dispatch(clearOperationError());
    }
  };

  if (loading) {
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
          Categorías
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
        <Typography variant="h4">Categorías</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva Categoría
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay categorías registradas
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Orden</TableCell>
                <TableCell>Versión</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Avatar
                      src={category.image.url}
                      alt={category.image.alt_text}
                      variant="rounded"
                      sx={{ width: 60, height: 45 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{category.image.position}</TableCell>
                  <TableCell>
                    <Chip label={`v${category.version}`} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(category)}
                      disabled={operationLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(category.id)}
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
      )}

      {/* Form Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        loading={operationLoading}
        error={operationError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer.
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

export default CategoriesPage;
