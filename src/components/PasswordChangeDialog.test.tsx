import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PasswordChangeDialog from './PasswordChangeDialog';
import authReducer from '../store/authSlice';

const theme = createTheme();
const mockOnClose = vi.fn();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

const createStore = (mustChangePassword = false) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: '1', email: 'admin@test.com', role: 'admin' as const, display_name: 'Admin', must_change_password: mustChangePassword, phone: null },
        isAuthenticated: true,
        loading: false,
        error: null,
        mustChangePassword,
      },
    },
  });

describe('PasswordChangeDialog', () => {
  it('debería renderizar el diálogo', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PasswordChangeDialog open={true} onClose={mockOnClose} />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/contraseña actual/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/nueva contraseña/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/confirmar nueva contraseña/i).length).toBeGreaterThanOrEqual(1);
  });

  it('debería tener botón de cambiar contraseña', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PasswordChangeDialog open={true} onClose={mockOnClose} />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('debería tener botón de cancelar', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PasswordChangeDialog open={true} onClose={mockOnClose} />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debería mostrar helper text de longitud mínima', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PasswordChangeDialog open={true} onClose={mockOnClose} />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument();
  });
});
