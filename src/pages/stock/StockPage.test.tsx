import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import StockPage from './StockPage';
import productsReducer from '../../store/productsSlice';
import stockReducer from '../../store/stockSlice';

const theme = createTheme();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('StockPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { 
        products: productsReducer,
        stock: stockReducer,
      },
      preloadedState: {
        products: {
          items: [],
          page: null,
          loading: false,
          error: null,
          operationLoading: false,
          operationError: null,
        },
        stock: {
          loading: false,
          error: null,
          lastAdjustment: null,
        },
      },
    });
  });

  it('debería renderizar el título de la página', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <StockPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Gestión de Stock')).toBeInTheDocument();
  });

  it('debería mostrar spinner cuando está cargando', () => {
    store = configureStore({
      reducer: { 
        products: productsReducer,
        stock: stockReducer,
      },
      preloadedState: {
        products: {
          items: [],
          page: null,
          loading: true,
          error: null,
          operationLoading: false,
          operationError: null,
        },
        stock: {
          loading: false,
          error: null,
          lastAdjustment: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <StockPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    store = configureStore({
      reducer: { 
        products: productsReducer,
        stock: stockReducer,
      },
      preloadedState: {
        products: {
          items: [],
          page: null,
          loading: false,
          error: 'Error al cargar productos',
          operationLoading: false,
          operationError: null,
        },
        stock: {
          loading: false,
          error: null,
          lastAdjustment: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <StockPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Error al cargar productos')).toBeInTheDocument();
  });
});
