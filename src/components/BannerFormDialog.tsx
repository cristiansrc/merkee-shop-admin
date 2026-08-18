import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { MediaUpload } from './MediaUpload';
import type { BannerResponse } from '../types/api';

interface BannerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any, version?: number) => void;
  banner?: BannerResponse | null;
  loading?: boolean;
  error?: string | null;
}

export const BannerFormDialog: React.FC<BannerFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  banner,
  loading = false,
  error = null,
}) => {
  const isEditing = !!banner;
  const [name, setName] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setName(banner.name);
      setImageKey(banner.image.key);
      setTargetPath(banner.target_path || '');
      setDisplayOrder(banner.display_order);
      setActive(banner.active);
    } else {
      setName('');
      setImageKey('');
      setTargetPath('');
      setDisplayOrder(0);
      setActive(true);
    }
    setFormError(null);
  }, [banner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 160) {
      setFormError('El nombre debe tener entre 2 y 160 caracteres');
      return;
    }
    if (!imageKey) {
      setFormError('Debe seleccionar una imagen');
      return;
    }
    if (displayOrder < 0) {
      setFormError('El orden de visualización no puede ser negativo');
      return;
    }
    if (targetPath && !targetPath.startsWith('/')) {
      setFormError('La ruta destino debe comenzar con /');
      return;
    }

    onSubmit(
      {
        name: name.trim(),
        image_key: imageKey,
        display_order: displayOrder,
        active,
        target_path: targetPath.trim() || null,
      },
      banner?.version
    );
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Banner' : 'Nuevo Banner'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {formError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Nombre del banner"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText={`${name.length}/160 caracteres`}
          />

          <TextField
            fullWidth
            label="Ruta destino (opcional)"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            margin="normal"
            disabled={loading}
            placeholder="/categorias/frutas"
            helperText="Ruta a la que redirige al hacer clic"
          />

          <TextField
            fullWidth
            label="Orden de visualización"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            margin="normal"
            required
            disabled={loading}
            helperText="Los banners se muestran en orden ascendente"
          />

          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={loading}
              />
            }
            label="Banner activo"
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            <MediaUpload
              onUploadComplete={(key: string) => setImageKey(key)}
              disabled={loading}
            />
          </Box>

          {isEditing && banner && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={banner.image.url}
                  alt={banner.name}
                  style={{ width: 120, height: 45, objectFit: 'cover', borderRadius: 4 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Imagen actual
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Versión: v{banner.version}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim() || !imageKey}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BannerFormDialog;
