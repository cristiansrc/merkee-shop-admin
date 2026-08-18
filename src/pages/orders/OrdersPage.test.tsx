import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import OrdersPage from './OrdersPage';
import ordersReducer from '../../store/ordersSlice';

const theme = createTheme();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('OrdersPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: {
        orders: {
          items: [],
          page: null,
          loading: false,
          error: null,
          selectedOrder: null,
        },
      },
    });
  });

  it('debería renderizar el título de la página', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Órdenes')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay órdenes', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('No hay órdenes registradas')).toBeInTheDocument();
  });

  it('debería mostrar filtro de estados', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByLabelText(/filtrar por estado/i)).toBeInTheDocument();
  });

  it('debería mostrar spinner cuando está cargando', () => {
    store = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: {
        orders: {
          items: [],
          page: null,
          loading: true,
          error: null,
          selectedOrder: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    store = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: {
        orders: {
          items: [],
          page: null,
          loading: false,
          error: 'Error al cargar órdenes',
          selectedOrder: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Error al cargar órdenes')).toBeInTheDocument();
  });

  it('debería mostrar información de solo lectura', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <OrdersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/consulta de pedidos de clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/solo lectura/i)).toBeInTheDocument();
  });
});
