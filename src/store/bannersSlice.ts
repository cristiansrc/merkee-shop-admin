import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bannersApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { BannerResponse } from '../types/api';

interface BannersState {
  items: BannerResponse[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: BannersState = {
  items: [],
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const fetchBanners = createAsyncThunk(
  'banners/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.banners : bannersApi;
      return await api.list();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar banners');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banners/create',
  async (data: {
    name: string;
    image_key: string;
    display_order: number;
    active: boolean;
    target_path?: string | null;
  }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.banners : bannersApi;
      return await api.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/update',
  async ({ id, data, version }: {
    id: string;
    data: {
      name: string;
      image_key: string;
      display_order: number;
      active: boolean;
      target_path?: string | null;
    };
    version: number;
  }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.banners : bannersApi;
      return await api.update(id, data, version);
    } catch (error: any) {
      if (error.response?.status === 409) {
        return rejectWithValue('Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.banners : bannersApi;
      await api.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar banner');
    }
  }
);

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearBannersError: (state) => {
      state.error = null;
    },
    clearBannerOperationError: (state) => {
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<BannerResponse[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createBanner.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createBanner.fulfilled, (state, action: PayloadAction<BannerResponse>) => {
        state.operationLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Update
      .addCase(updateBanner.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateBanner.fulfilled, (state, action: PayloadAction<BannerResponse>) => {
        state.operationLoading = false;
        const index = state.items.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Delete
      .addCase(deleteBanner.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading = false;
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearBannersError, clearBannerOperationError } = bannersSlice.actions;
export default bannersSlice.reducer;
