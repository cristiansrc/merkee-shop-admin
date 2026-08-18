import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { RootState, AppDispatch } from '../store';
import { provisionAdmin, clearAdminError, clearAdminSuccess } from '../store/adminSlice';

interface ProvisionAdminDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Diálogo para provisionar un nuevo administrador.
 * Solo un admin con must_change_password=false puede usarlo.
 * El token de activación se entrega por canal operativo aprobado,
 * NUNCA se muestra en la UI ni se almacena.
 */
export const ProvisionAdminDialog: React.FC<ProvisionAdminDialogProps> = ({ open, onClose }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success, lastProvisioned } = useSelector(
    (state: RootState) => state.admin
  );

  const handleClose = () => {
    setDisplayName('');
    setEmail('');
    setPhone('');
    dispatch(clearAdminError());
    dispatch(clearAdminSuccess());
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      provisionAdmin({
        display_name: displayName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
      })
    );
    if (provisionAdmin.fulfilled.match(result)) {
      // El token NO se muestra en la UI; se entrega por canal operativo
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aprovisionar Nuevo Administrador</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          El nuevo administrador recibirá un token de activación por el canal administrativo
          aprobado. Deberá usarlo para establecer su primera contraseña.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
            {error}
          </Alert>
        )}

        {success && lastProvisioned && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Administrador aprovisionado exitosamente
            </Typography>
            <Typography variant="body2">
              Nombre: {lastProvisioned.display_name}
            </Typography>
            <Typography variant="body2">
              Correo: {lastProvisioned.email}
            </Typography>
            <Typography variant="body2">
              El token de activación expira el:{' '}
              {new Date(lastProvisioned.activation_expires_at).toLocaleString('es-CO')}
            </Typography>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Importante: Entregue el token de activación al nuevo administrador
                por el canal operativo aprobado. El token no se volverá a mostrar.
              </Typography>
            </Box>
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              margin="normal"
              required
              autoFocus
              helperText="Entre 2 y 100 caracteres"
              slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }}
            />
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              helperText="Se usará para iniciar sesión"
              slotProps={{ htmlInput: { maxLength: 254 } }}
            />
            <TextField
              fullWidth
              label="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              helperText="Máximo 30 caracteres"
              slotProps={{ htmlInput: { maxLength: 30 } }}
            />
          </form>
        )}
      </DialogContent>
      <DialogActions>
        {success ? (
          <Button onClick={handleClose} variant="contained">
            Cerrar
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Aprovisionando...' : 'Aprovisionar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProvisionAdminDialog;
