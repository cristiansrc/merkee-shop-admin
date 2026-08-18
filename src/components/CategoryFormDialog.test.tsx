import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import CategoryFormDialog from './CategoryFormDialog';

const theme = createTheme();

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
  category: null,
};

const categoryWithImage = {
  id: 'cat-001',
  name: 'Frutas',
  image: { key: 'frutas', url: 'https://placehold.co/400x300?text=Frutas', alt_text: 'Frutas', position: 0 },
  version: 1,
};

describe('CategoryFormDialog', () => {
  it('debería renderizar el diálogo de creación', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('Nueva Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  });

  it('debería renderizar el diálogo de edición con datos existentes', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} category={categoryWithImage} />
      </ThemeProvider>
    );

    expect(screen.getByText('Editar Categoría')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Frutas')).toBeInTheDocument();
  });

  it('debería tener botón de cancelar', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debería tener botón de crear (deshabilitado sin imagen)', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} />
      </ThemeProvider>
    );

    const createButton = screen.getByRole('button', { name: /crear/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  it('debería tener botón de actualizar en modo edición', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} category={categoryWithImage} />
      </ThemeProvider>
    );

    const updateButton = screen.getByRole('button', { name: /actualizar/i });
    expect(updateButton).toBeInTheDocument();
  });

  it('debería tener botón de seleccionar imagen', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText(/seleccionar imagen/i)).toBeInTheDocument();
  });

  it('debería mostrar contador de caracteres', () => {
    render(
      <ThemeProvider theme={theme}>
        <CategoryFormDialog {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('0/100 caracteres')).toBeInTheDocument();
  });
});
