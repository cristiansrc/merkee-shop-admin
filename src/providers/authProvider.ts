import type { AuthProvider } from '@refinedev/core';
import { store } from '../store';
import { login as loginThunk, logout as logoutThunk, refresh as refreshThunk } from '../store/authSlice';

/**
 * AuthProvider que integra el sistema de autenticación existente (Redux + API)
 * con el sistema de autenticación de Refine.
 *
 * Utiliza los thunks de Redux existentes para login, logout y verificación
 * de sesión, manteniendo la compatibilidad con el AuthGuard y el flujo actual.
 */
export const authProvider: AuthProvider = {
  /**
   * Login: despacha el thunk de login de Redux.
   */
  login: async ({ email, password }) => {
    const result = await store.dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      return { success: true };
    }
    return {
      success: false,
      error: {
        name: 'LoginError',
        message: result.payload as string || 'Error al iniciar sesión',
      },
    };
  },

  /**
   * Logout: despacha el thunk de logout de Redux.
   */
  logout: async () => {
    await store.dispatch(logoutThunk());
    return { success: true };
  },

  /**
   * Verifica si el usuario está autenticado intentando restaurar la sesión
   * con refresh silencioso (cookie HttpOnly) y, si aplica, el perfil.
   */
  check: async () => {
    const state = store.getState();
    if (state.auth.isAuthenticated) {
      return { authenticated: true };
    }

    // Restaurar sesión: refresh silencioso (si la cookie de refresh es válida)
    try {
      const refreshResult = await store.dispatch(refreshThunk());
      if (!refreshThunk.fulfilled.match(refreshResult)) {
        throw new Error('no session');
      }
      return { authenticated: true };
    } catch {
      // Sin cookie de refresh válida: no autenticado
    }

    return {
      authenticated: false,
      logout: true,
      error: {
        name: 'UnauthorizedError',
        message: 'No autenticado',
      },
    };
  },

  /**
   * Obtiene la identidad del usuario actual.
   */
  getIdentity: async () => {
    const state = store.getState();
    const user = state.auth.user;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    return {
      id: user.id,
      name: user.display_name || user.email,
      email: user.email,
    };
  },

  /**
   * Verifica si el usuario tiene un permiso específico.
   * Actualmente todos los admin autenticados tienen los mismos permisos.
   */
  getPermissions: async () => {
    const state = store.getState();
    if (state.auth.isAuthenticated) {
      return ['admin'];
    }
    return null;
  },

  /**
   * Maneja la respuesta de error de la API (ej: 401).
   */
  onError: async (error) => {
    if (error.statusCode === 401) {
      return {
        logout: true,
        error: {
          name: 'UnauthorizedError',
          message: 'Sesión expirada',
        },
      };
    }
    return {};
  },
};
