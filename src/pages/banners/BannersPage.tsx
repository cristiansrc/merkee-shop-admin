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
  Switch,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  clearBannerOperationError,
} from '../../store/bannersSlice';
import { BannerFormDialog } from '../../components/BannerFormDialog';
import type { BannerResponse } from '../../types/api';

export const BannersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.banners
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleCreate = () => {
    setSelectedBanner(null);
    setDialogOpen(true);
  };

  const handleEdit = (banner: BannerResponse) => {
    setSelectedBanner(banner);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const result = await dispatch(deleteBanner(deleteConfirm));
    if (deleteBanner.fulfilled.match(result)) {
      setSnackbar({ open: true, message: 'Banner eliminado exitosamente', severity: 'success' });
    } else {
      setSnackbar({
        open: true,
        message: result.payload as string || 'Error al eliminar banner',
        severity: 'error',
      });
    }
    setDeleteConfirm(null);
  };

  const handleFormSubmit = async (data: any, version?: number) => {
    let result;
    if (selectedBanner && version !== undefined) {
      result = await dispatch(updateBanner({ id: selectedBanner.id, data, version }));
    } else {
      result = await dispatch(createBanner(data));
    }

    if (createBanner.fulfilled.match(result) || updateBanner.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: selectedBanner ? 'Banner actualizado exitosamente' : 'Banner creado exitosamente',
        severity: 'success',
      });
      setDialogOpen(false);
      setSelectedBanner(null);
    }
  };

  const handleDialogClose = () => {
    if (!operationLoading) {
      setDialogOpen(false);
      setSelectedBanner(null);
      dispatch(clearBannerOperationError());
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
          Banners
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
        <Typography variant="h4">Banners</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Banner
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay banners registrados
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Ruta Destino</TableCell>
                <TableCell>Orden</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell>Versión</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Avatar
                      src={banner.image.url}
                      alt={banner.image.alt_text}
                      variant="rounded"
                      sx={{ width: 120, height: 45 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {banner.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={banner.target_path || 'Sin ruta'} size="small" />
                  </TableCell>
                  <TableCell>{banner.display_order}</TableCell>
                  <TableCell>
                    <Switch checked={banner.active} disabled size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={`v${banner.version}`} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(banner)}
                      disabled={operationLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(banner.id)}
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
      <BannerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
        banner={selectedBanner}
        loading={operationLoading}
        error={operationError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este banner? Esta acción no se puede deshacer.
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

export default BannersPage;
