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
  Typography,
} from '@mui/material';
import { MediaUpload } from './MediaUpload';
import type { CategoryResponse } from '../types/api';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; image_key: string }, version?: number) => void;
  category?: CategoryResponse | null;
  loading?: boolean;
  error?: string | null;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  category,
  loading = false,
  error = null,
}) => {
  const isEditing = !!category;
  const [name, setName] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImageKey(category.image.key);
    } else {
      setName('');
      setImageKey('');
    }
    setFormError(null);
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      setFormError('El nombre debe tener entre 2 y 100 caracteres');
      return;
    }
    if (!imageKey) {
      setFormError('Debe seleccionar una imagen');
      return;
    }

    onSubmit(
      { name: name.trim(), image_key: imageKey },
      category?.version
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
        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText={`${name.length}/100 caracteres`}
          />

          <Box sx={{ mt: 2 }}>
            <MediaUpload
              onUploadComplete={(key: string) => {
                setImageKey(key);
              }}
              disabled={loading}
            />
          </Box>

          {isEditing && category && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={category.image.url}
                  alt={category.name}
                  style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Imagen actual
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Versión: v{category.version}
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

export default CategoryFormDialog;
