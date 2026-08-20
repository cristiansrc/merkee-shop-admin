import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { OrderResponse, PageMeta } from '../types/api';

interface OrdersState {
  items: OrderResponse[];
  page: PageMeta | null;
  loading: boolean;
  error: string | null;
  selectedOrder: OrderResponse | null;
}

const initialState: OrdersState = {
  items: [],
  page: null,
  loading: false,
  error: null,
  selectedOrder: null,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async ({ page, size, status }: { page?: number; size?: number; status?: string }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.orders : ordersApi;
      return await api.list(page, size, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar pedidos');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.orders : ordersApi;
      return await api.get(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar pedido');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrdersError, clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;