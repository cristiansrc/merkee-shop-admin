import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import { RootState } from '../store';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Guard de autenticación que verifica:
 * 1. Si está cargando, muestra spinner.
 * 2. Si no está autenticado, redirige a /login.
 * 3. Si must_change_password es true, solo permite /password-change, /logout, /me, /auth/refresh.
 *    Cualquier otra ruta protegida redirige a /password-change.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, mustChangePassword } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el admin debe cambiar contraseña, solo permitir la ruta de cambio
  if (mustChangePassword && location.pathname !== '/password-change') {
    return <Navigate to="/password-change" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
