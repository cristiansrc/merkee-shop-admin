import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import CategoriesPage from './CategoriesPage';
import categoriesReducer from '../../store/categoriesSlice';

const theme = createTheme();

// Mock de react-redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('CategoriesPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { categories: categoriesReducer },
      preloadedState: {
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
            <CategoriesPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Categorías')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay categorías', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <CategoriesPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('No hay categorías registradas')).toBeInTheDocument();
  });

  it('debería mostrar botón de nueva categoría', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <CategoriesPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /nueva categoría/i })).toBeInTheDocument();
  });

  it('debería mostrar spinner cuando está cargando', () => {
    store = configureStore({
      reducer: { categories: categoriesReducer },
      preloadedState: {
        categories: {
          items: [],
          loading: true,
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
            <CategoriesPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    store = configureStore({
      reducer: { categories: categoriesReducer },
      preloadedState: {
        categories: {
          items: [],
          loading: false,
          error: 'Error al cargar categorías',
          operationLoading: false,
          operationError: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <CategoriesPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Error al cargar categorías')).toBeInTheDocument();
  });
});
