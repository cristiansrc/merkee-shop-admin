import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import ProductFormDialog from './ProductFormDialog';
import type { CategoryResponse, ProductResponse } from '../types/api';

// Mockear MediaUpload para evitar dependencias de upload real
vi.mock('./MediaUpload', () => ({
  MediaUpload: ({ onUploadComplete, disabled }: { onUploadComplete: (key: string) => void; disabled: boolean }) => (
    <button
      data-testid="media-upload-btn"
      disabled={disabled}
      onClick={() => onUploadComplete('test-image-key-001')}
    >
      Subir imagen
    </button>
  ),
}));

const theme = createTheme();

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const categories: CategoryResponse[] = [
  { id: 'cat-uuid-001', name: 'Frutas', image: { key: 'f', url: '', alt_text: '', position: 0 }, version: 1 },
  { id: 'cat-uuid-002', name: 'Verduras', image: { key: 'v', url: '', alt_text: '', position: 0 }, version: 1 },
];

const product: ProductResponse = {
  id: 'prod-001',
  category: categories[0],
  name: 'Manzana',
  description: 'Manzana fresca',
  regular_price_cop: 5000,
  sale_price_cop: 4000,
  unit: 'kg',
  stock_available: 100,
  images: [{ key: 'img-001', url: '', alt_text: 'Manzana', position: 0 }],
  version: 1,
};

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
  categories,
  loading: false,
  error: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductFormDialog', () => {
  describe('Auto-selección de categoría cuando llegan después del montaje', () => {
    it('debería auto-seleccionar la primera categoría cuando categories carga después (producto nuevo)', async () => {
      // Renderizar con categorías vacías (simula carga tardía)
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} categories={[]} />
        </ThemeProvider>
      );

      // Re-render con categorías cargadas
      rerender(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} categories={categories} />
        </ThemeProvider>
      );

      // Esperar a que el Select se actualice con la primera categoría
      await waitFor(() => {
        expect(screen.getByText('Frutas')).toBeInTheDocument();
      });
    });

    it('debería preservar la categoría del producto al editar, incluso si categories carga después', async () => {
      // Renderizar con producto y sin categorías (simula carga tardía)
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} product={product} categories={[]} />
        </ThemeProvider>
      );

      // Re-render con categorías cargadas
      rerender(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} product={product} categories={categories} />
        </ThemeProvider>
      );

      // La categoría del producto debe estar visible
      await waitFor(() => {
        expect(screen.getByText('Frutas')).toBeInTheDocument();
      });
    });

    it('debería enviar category_id como UUID en el payload', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} categories={categories} />
        </ThemeProvider>
      );

      // La primera categoría debe estar seleccionada automáticamente
      await waitFor(() => {
        expect(screen.getByText('Frutas')).toBeInTheDocument();
      });

      // Completar campos obligatorios
      await user.type(screen.getByLabelText(/nombre del producto/i), 'Lechuga');
      await user.type(screen.getByLabelText(/descripción/i), 'Lechuga fresca');
      await user.type(screen.getByLabelText(/unidad/i), 'pieza');
      await user.type(screen.getByLabelText(/precio regular/i), '3000');
      await user.type(screen.getByLabelText(/precio descuento/i), '2500');
      await user.type(screen.getByLabelText(/stock inicial/i), '50');

      // Agregar imagen (primero crear slot, luego subir)
      await user.click(screen.getByRole('button', { name: /agregar imagen/i }));
      await user.click(screen.getByTestId('media-upload-btn'));

      // Enviar formulario
      await user.click(screen.getByRole('button', { name: /crear/i }));

      // Verificar que el payload usa category_id con UUID
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.category_id).toBe('cat-uuid-001');
      expect(typeof submittedData.category_id).toBe('string');
    });
  });

  describe('Renderizado básico', () => {
    it('debería renderizar el diálogo de creación', () => {
      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} />
        </ThemeProvider>
      );

      expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
    });

    it('debería renderizar el diálogo de edición', () => {
      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} product={product} />
        </ThemeProvider>
      );

      expect(screen.getByText('Editar Producto')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Manzana')).toBeInTheDocument();
    });

    it('debería tener botón de cancelar', () => {
      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('debería tener botón de crear', () => {
      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
    });

    it('debería mostrar error de la API si se provee', () => {
      render(
        <ThemeProvider theme={theme}>
          <ProductFormDialog {...defaultProps} error="Error del servidor" />
        </ThemeProvider>
      );

      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    });
  });
});
