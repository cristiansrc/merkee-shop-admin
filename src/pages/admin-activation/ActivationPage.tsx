import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Visibility, VisibilityOff, VpnKey } from '@mui/icons-material';
import { activationApi, getLocalizedError } from '../../api/client';

/**
 * Página pública de activación de admin.
 * Un admin recién aprovisionado usa el token recibido por canal operativo
 * para establecer su primera contraseña.
 *
 * REGLAS DE SEGURIDAD:
 * - El token NUNCA se muestra en logs, UI persistente o almacenamiento local.
 * - El token se envía una sola vez y se consume atómicamente.
 * - No se almacena en localStorage, sessionStorage, cookies o Redux.
 */
export const ActivationPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (token.length < 32) {
      setError('El token de activación debe tener al menos 32 caracteres');
      return;
    }

    if (newPassword.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres');
      return;
    }

    if (newPassword.length > 128) {
      setError('La contraseña no puede exceder 128 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await activationApi.activate({ token, new_password: newPassword });
      setSuccess(true);
      // Limpiar campos sensibles inmediatamente después del éxito
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: string; message?: string } } };
      const code = axiosErr.response?.data?.code;
      if (code === 'ACTIVATION_TOKEN_INVALID_OR_EXPIRED') {
        setError('El token de activación es inválido o ha expirado. Solicite uno nuevo al administrador.');
      } else if (code === 'EMAIL_ALREADY_REGISTERED') {
        setError('Este correo ya está registrado');
      } else {
        setError(
          axiosErr.response?.data?.message ||
            getLocalizedError(code || '')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
              }}
            >
              <VpnKey sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Cuenta Activada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Su cuenta de administrador ha sido activada exitosamente.
              Ya puede iniciar sesión con su correo y la contraseña que acabó de establecer.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Ir al Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <VpnKey sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Activar Cuenta de Administrador
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Ingrese el token de activación recibido por el canal administrativo
              y establezca su primera contraseña.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Token de activación"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              margin="normal"
              required
              autoFocus
              helperText="Pegue el token completo recibido por el canal administrativo"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar token"
                        onClick={() => setShowToken(!showToken)}
                        edge="end"
                        size="small"
                      >
                        {showToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
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
                        aria-label="Mostrar contraseña"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showPassword ? 'text' : 'password'}
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
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
              {loading ? 'Activando...' : 'Activar Cuenta'}
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            color="inherit"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Volver al Inicio de Sesión
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivationPage;
