import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
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
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;