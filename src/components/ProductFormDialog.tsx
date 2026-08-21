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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import { MediaUpload } from './MediaUpload';
import type { ProductResponse, CategoryResponse } from '../types/api';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any, version?: number) => void;
  product?: ProductResponse | null;
  categories: CategoryResponse[];
  loading?: boolean;
  error?: string | null;
}

interface ImageItem {
  key: string;
  alt_text: string;
  position: number;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  product,
  categories,
  loading = false,
  error = null,
}) => {
  const isEditing = !!product;
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regularPriceCop, setRegularPriceCop] = useState<number>(0);
  const [salePriceCop, setSalePriceCop] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [stockOnHand, setStockOnHand] = useState<number>(0);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setCategoryId(product.category.id);
      setName(product.name);
      setDescription(product.description);
      setRegularPriceCop(product.regular_price_cop);
      setSalePriceCop(product.sale_price_cop);
      setUnit(product.unit);
      setStockOnHand(product.stock_available);
      setImages(
        product.images.map((img: { key: string; alt_text: string; position: number }) => ({
          key: img.key,
          alt_text: img.alt_text,
          position: img.position,
        }))
      );
    } else {
      setCategoryId('');
      setName('');
      setDescription('');
      setRegularPriceCop(0);
      setSalePriceCop(0);
      setUnit('');
      setStockOnHand(0);
      setImages([]);
    }
    setFormError(null);
  }, [product, open]);

  // Auto-seleccionar primera categoría cuando llegan después del montaje
  // (solo para productos nuevos donde categoryId sigue vacío).
  useEffect(() => {
    if (!product && open && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [product, open, categoryId, categories]);

  const handleAddImage = () => {
    if (images.length >= 10) {
      setFormError('Máximo 10 imágenes por producto');
      return;
    }
    setImages([...images, { key: '', alt_text: name, position: images.length }]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageUpload = (index: number, key: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], key };
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryId) {
      setFormError('Seleccione una categoría');
      return;
    }
    if (!name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 160) {
      setFormError('El nombre debe tener entre 2 y 160 caracteres');
      return;
    }
    if (!description.trim()) {
      setFormError('La descripción es obligatoria');
      return;
    }
    if (description.trim().length > 10000) {
      setFormError('La descripción no puede exceder 10,000 caracteres');
      return;
    }
    if (regularPriceCop < 0) {
      setFormError('El precio regular no puede ser negativo');
      return;
    }
    if (salePriceCop < 0) {
      setFormError('El precio de descuento no puede ser negativo');
      return;
    }
    if (!unit.trim()) {
      setFormError('La unidad es obligatoria');
      return;
    }
    if (!isEditing && stockOnHand < 0) {
      setFormError('El stock no puede ser negativo');
      return;
    }
    if (images.length === 0) {
      setFormError('Debe agregar al menos una imagen');
      return;
    }
    if (images.some((img) => !img.key)) {
      setFormError('Todas las imágenes deben tener una clave válida');
      return;
    }

    const data = {
      category_id: categoryId,
      name: name.trim(),
      description: description.trim(),
      regular_price_cop: regularPriceCop,
      sale_price_cop: salePriceCop,
      unit: unit.trim(),
      ...(!isEditing && { stock_on_hand: stockOnHand }),
      images: images.map((img) => ({
        key: img.key,
        alt_text: img.alt_text || name.trim(),
        position: img.position,
      })),
    };

    onSubmit(data, product?.version);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                label="Categoría"
                disabled={loading}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Unidad"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              placeholder="kg, litro, pieza, etc."
            />
          </Box>

          <TextField
            fullWidth
            label="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText={`${name.length}/160 caracteres`}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            multiline
            rows={3}
            helperText={`${description.length}/10,000 caracteres`}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Precio regular (COP)"
              type="number"
              value={regularPriceCop}
              onChange={(e) => setRegularPriceCop(parseInt(e.target.value) || 0)}
              margin="normal"
              required
              disabled={loading}
              helperText={formatCOP(regularPriceCop)}
            />

            <TextField
              fullWidth
              label="Precio descuento (COP)"
              type="number"
              value={salePriceCop}
              onChange={(e) => setSalePriceCop(parseInt(e.target.value) || 0)}
              margin="normal"
              required
              disabled={loading}
              helperText={formatCOP(salePriceCop)}
            />
          </Box>

          {!isEditing && (
            <TextField
              fullWidth
              label="Stock inicial"
              type="number"
              value={stockOnHand}
              onChange={(e) => setStockOnHand(parseInt(e.target.value) || 0)}
              margin="normal"
              required
              disabled={loading}
              helperText="Stock inicial solo al crear el producto"
            />
          )}

          {isEditing && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Para ajustar el stock, use la sección de Gestión de Stock
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">
                Imágenes ({images.length}/10)
              </Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={handleAddImage}
                disabled={loading || images.length >= 10}
              >
                Agregar imagen
              </Button>
            </Box>

            {images.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Agregue al menos una imagen para el producto
              </Alert>
            ) : (
              <List dense>
                {images.map((img, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <MediaUpload
                        onUploadComplete={(key: string) => handleImageUpload(index, key)}
                        disabled={loading}
                      />
                      {img.key && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Clave: {img.key}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveImage(index)}
                      disabled={loading}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim() || !categoryId || images.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;
