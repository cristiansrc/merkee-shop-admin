import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/react-router';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { AuthGuard } from './components/AuthGuard';
import { DashboardLayout } from './layout/DashboardLayout';
import { LoginPage } from './pages/login/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { BannersPage } from './pages/banners/BannersPage';
import { StockPage } from './pages/stock/StockPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { ActivationPage } from './pages/admin-activation/ActivationPage';
import { PasswordChangePage } from './pages/password-change/PasswordChangePage';

// QueryClient para TanStack Query (requerido por Refine)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Tema personalizado para Merkee Admin
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Recursos definidos para Refine
const resources = [
  {
    name: 'categories',
    list: '/categories',
  },
  {
    name: 'products',
    list: '/products',
  },
  {
    name: 'banners',
    list: '/banners',
  },
  {
    name: 'orders',
    list: '/orders',
  },
];

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            resources={resources}
            options={{
              syncWithLocation: false,
              warnWhenUnsavedChanges: false,
              redirect: {
                afterCreate: 'list',
                afterEdit: 'list',
                afterClone: 'list',
              },
            }}
          >
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Routes>
                {/* Ruta de login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Ruta pública de activación de admin (token de un solo uso) */}
                <Route path="/activation" element={<ActivationPage />} />

                {/* Ruta protegida de cambio obligatorio de contraseña */}
                <Route
                  path="/password-change"
                  element={
                    <AuthGuard>
                      <PasswordChangePage />
                    </AuthGuard>
                  }
                />

                {/* Rutas protegidas del admin */}
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <DashboardLayout />
                    </AuthGuard>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="banners" element={<BannersPage />} />
                  <Route path="stock" element={<StockPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                </Route>

                {/* Redirigir rutas no encontradas */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ThemeProvider>
          </Refine>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
