import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { ProductResponse, PageMeta } from '../types/api';

interface ProductsState {
  items: ProductResponse[];
  page: PageMeta | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ProductsState = {
  items: [],
  page: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page, size }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.products : productsApi;
      return await api.list(page, size);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar productos');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (data: {
    category_id: string;
    name: string;
    description: string;
    regular_price_cop: number;
    sale_price_cop: number;
    unit: string;
    stock_on_hand: number;
    images: Array<{ key: string; alt_text: string; position: number }>;
  }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.products : productsApi;
      return await api.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear producto');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data, version }: {
    id: string;
    data: {
      category_id: string;
      name: string;
      description: string;
      regular_price_cop: number;
      sale_price_cop: number;
      unit: string;
      images: Array<{ key: string; alt_text: string; position: number }>;
    };
    version: number;
  }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.products : productsApi;
      return await api.update(id, data, version);
    } catch (error: any) {
      if (error.response?.status === 409) {
        return rejectWithValue('Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar producto');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.products : productsApi;
      await api.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar producto');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
    clearProductOperationError: (state) => {
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<ProductResponse>) => {
        state.operationLoading = false;
        state.items.unshift(action.payload);
        if (state.page) {
          state.page = { ...state.page, total: state.page.total + 1 };
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Update
      .addCase(updateProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<ProductResponse>) => {
        state.operationLoading = false;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Delete
      .addCase(deleteProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.page) {
          state.page = { ...state.page, total: state.page.total - 1 };
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearProductsError, clearProductOperationError } = productsSlice.actions;
export default productsSlice.reducer;
