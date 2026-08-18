import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminUsersApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { AdminUserProvisionResponse, CreateAdminUserRequest } from '../types/api';

interface AdminState {
  lastProvisioned: AdminUserProvisionResponse | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AdminState = {
  lastProvisioned: null,
  loading: false,
  error: null,
  success: false,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || true;

export const provisionAdmin = createAsyncThunk(
  'admin/provision',
  async (data: CreateAdminUserRequest, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.adminUsers : adminUsersApi;
      return await api.provision(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al aprovisionar administrador';
      return rejectWithValue(msg);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.success = false;
      state.lastProvisioned = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(provisionAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(provisionAdmin.fulfilled, (state, action: PayloadAction<AdminUserProvisionResponse>) => {
        state.loading = false;
        state.lastProvisioned = action.payload;
        state.success = true;
      })
      .addCase(provisionAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions;
export default adminSlice.reducer;
