import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import ProductsPage from './ProductsPage';
import productsReducer from '../../store/productsSlice';
import categoriesReducer from '../../store/categoriesSlice';

const theme = createTheme();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('ProductsPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { 
        products: productsReducer,
        categories: categoriesReducer,
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
        categories: {
          items: [],
          loading: false,
          error: null,
          operationLoading: false,
          operationError: null,
        },
      },
    });
  });

  it('debería renderizar el título de la página', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay productos', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('No hay productos registrados')).toBeInTheDocument();
  });

  it('debería mostrar campo de búsqueda', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/buscar productos/i)).toBeInTheDocument();
  });

  it('debería mostrar botón de nuevo producto', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument();
  });

  it('debería mostrar spinner cuando está cargando', () => {
    store = configureStore({
      reducer: { 
        products: productsReducer,
        categories: categoriesReducer,
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
        categories: {
          items: [],
          loading: false,
          error: null,
          operationLoading: false,
          operationError: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
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
        categories: categoriesReducer,
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
        categories: {
          items: [],
          loading: false,
          error: null,
          operationLoading: false,
          operationError: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <ProductsPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Error al cargar productos')).toBeInTheDocument();
  });
});
