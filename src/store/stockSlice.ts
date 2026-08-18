import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { stockApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { StockAdjustmentResponse } from '../types/api';

interface StockState {
  lastAdjustment: StockAdjustmentResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: StockState = {
  lastAdjustment: null,
  loading: false,
  error: null,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || true;

export const createStockAdjustment = createAsyncThunk(
  'stock/createAdjustment',
  async ({ productId, data }: {
    productId: string;
    data: { quantity_delta: number; reason: string };
  }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.stock : stockApi;
      return await api.createAdjustment(productId, data);
    } catch (error: any) {
      if (error.response?.status === 422) {
        return rejectWithValue('Stock insuficiente: el resultado no puede ser negativo');
      }
      if (error.response?.status === 404) {
        return rejectWithValue('Producto no encontrado');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al ajustar stock');
    }
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    clearStockError: (state) => {
      state.error = null;
    },
    clearLastAdjustment: (state) => {
      state.lastAdjustment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStockAdjustment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStockAdjustment.fulfilled, (state, action: PayloadAction<StockAdjustmentResponse>) => {
        state.loading = false;
        state.lastAdjustment = action.payload;
      })
      .addCase(createStockAdjustment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStockError, clearLastAdjustment } = stockSlice.actions;
export default stockSlice.reducer;
