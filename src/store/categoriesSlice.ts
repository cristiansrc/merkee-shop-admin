import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriesApi } from '../api/client';
import { mockApi } from '../api/mocks/mockApi';
import type { CategoryResponse } from '../types/api';

interface CategoriesState {
  items: CategoryResponse[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.categories : categoriesApi;
      return await api.list();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar categorías');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: { name: string; image_key: string }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.categories : categoriesApi;
      return await api.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear categoría');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data, version }: { id: string; data: { name: string; image_key: string }; version: number }, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.categories : categoriesApi;
      return await api.update(id, data, version);
    } catch (error: any) {
      if (error.response?.status === 409) {
        return rejectWithValue('Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar categoría');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const api = USE_MOCKS ? mockApi.categories : categoriesApi;
      await api.delete(id);
      return id;
    } catch (error: any) {
      if (error.response?.status === 409) {
        return rejectWithValue('No se puede eliminar: la categoría tiene productos asociados');
      }
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar categoría');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
    clearOperationError: (state) => {
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoryResponse[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<CategoryResponse>) => {
        state.operationLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<CategoryResponse>) => {
        state.operationLoading = false;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearCategoriesError, clearOperationError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
