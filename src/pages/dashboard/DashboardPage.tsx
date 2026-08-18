import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';

const summaryCards = [
  {
    title: 'Categorías',
    description: 'Gestionar categorías del catálogo',
    icon: <CategoryIcon sx={{ fontSize: 40 }} />,
    path: '/categories',
    color: '#1976d2',
  },
  {
    title: 'Productos',
    description: 'Administrar productos e inventario',
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    path: '/products',
    color: '#388e3c',
  },
  {
    title: 'Banners',
    description: 'Gestionar banners de la portada',
    icon: <ImageIcon sx={{ fontSize: 40 }} />,
    path: '/banners',
    color: '#f57c00',
  },
  {
    title: 'Órdenes',
    description: 'Consultar pedidos de clientes',
    icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
    path: '/orders',
    color: '#7b1fa2',
  },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido, {user?.display_name || 'Administrador'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panel de administración de Merkee.shop
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: card.color,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button size="small" onClick={() => navigate(card.path)}>
                  Acceder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Versión: 0.1.0-admin | API: v1 | Estado: {navigator.onLine ? 'En línea' : 'Sin conexión'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;