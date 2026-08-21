import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, passwordApi, clearRefreshState } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { UserResponse } from '../types/api';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  mustChangePassword: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  mustChangePassword: false,
};

// Flag para usar mocks cuando la API no está disponible
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.auth : authApi;
      const response = await api.login(email, password);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.auth : authApi;
      return await api.getProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener perfil');
    }
  }
);

export const refresh = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.auth : authApi;
      const response = await api.refreshToken();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sesión expirada');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.auth : authApi;
      await api.logout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cerrar sesión');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { current_password, new_password }: { current_password: string; new_password: string },
    { rejectWithValue }
  ) => {
    try {
      if (USE_MOCKS) {
        await mockApi.password.change({ current_password, new_password });
      } else {
        await passwordApi.change({ current_password, new_password });
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 'CURRENT_PASSWORD_INVALID') {
        return rejectWithValue('La contraseña actual es incorrecta');
      }
      if (code === 'IDEMPOTENCY_KEY_REUSED') {
        return rejectWithValue('La solicitud ya fue procesada');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.mustChangePassword = action.payload.must_change_password;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.mustChangePassword = action.payload.must_change_password;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.mustChangePassword = false;
      })
      // Refresh (restauración silenciosa de sesión)
      .addCase(refresh.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.mustChangePassword = action.payload.must_change_password;
      })
      .addCase(refresh.rejected, (state) => {
        // Limpiar timer de refresh, promise y token en memoria para que
        // la sesión quede completamente inconsistente y no se reintente.
        clearRefreshState();
        state.user = null;
        state.isAuthenticated = false;
        state.mustChangePassword = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.mustChangePassword = false;
      })
      // Change Password
      .addCase(changePassword.fulfilled, (state) => {
        state.mustChangePassword = false;
        if (state.user) {
          state.user.must_change_password = false;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;