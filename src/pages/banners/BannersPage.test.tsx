import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import BannersPage from './BannersPage';
import bannersReducer from '../../store/bannersSlice';

const theme = createTheme();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe('BannersPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { banners: bannersReducer },
      preloadedState: {
        banners: {
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
            <BannersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Banners')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay banners', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <BannersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('No hay banners registrados')).toBeInTheDocument();
  });

  it('debería mostrar botón de nuevo banner', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <BannersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /nuevo banner/i })).toBeInTheDocument();
  });

  it('debería mostrar spinner cuando está cargando', () => {
    store = configureStore({
      reducer: { banners: bannersReducer },
      preloadedState: {
        banners: {
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
            <BannersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    store = configureStore({
      reducer: { banners: bannersReducer },
      preloadedState: {
        banners: {
          items: [],
          loading: false,
          error: 'Error al cargar banners',
          operationLoading: false,
          operationError: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <BannersPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Error al cargar banners')).toBeInTheDocument();
  });
});
