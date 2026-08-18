import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { changePassword, logout } from '../../store/authSlice';

/**
 * Página de cambio obligatorio de contraseña.
 * Se muestra cuando un admin con must_change_password=true intenta acceder al dashboard.
 * Solo puede cerrar sesión o cambiar su contraseña.
 */
export const PasswordChangePage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword.length < 12) {
      setLocalError('La nueva contraseña debe tener al menos 12 caracteres');
      return;
    }

    if (newPassword.length > 128) {
      setLocalError('La nueva contraseña no puede exceder 128 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      setLocalError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    const result = await dispatch(
      changePassword({ current_password: currentPassword, new_password: newPassword })
    );
    if (changePassword.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const displayError = localError || error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockOutlined sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Cambio de Contraseña Requerido
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Debe cambiar su contraseña antes de acceder al panel de administración.
              Esta es su primera sesión y por seguridad debe establecer una contraseña personalizada.
            </Typography>
          </Box>

          {displayError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
              {displayError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Contraseña actual"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              autoFocus
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar contraseña actual"
                        onClick={() => setShowCurrent(!showCurrent)}
                        edge="end"
                        size="small"
                      >
                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Mínimo 12 caracteres, máximo 128"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar nueva contraseña"
                        onClick={() => setShowNew(!showNew)}
                        edge="end"
                        size="small"
                      >
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar confirmación"
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        size="small"
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            color="inherit"
            onClick={handleLogout}
            disabled={loading}
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PasswordChangePage;
