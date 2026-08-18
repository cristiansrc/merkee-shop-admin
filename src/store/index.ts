import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import categoriesReducer from './categoriesSlice';
import productsReducer from './productsSlice';
import bannersReducer from './bannersSlice';
import ordersReducer from './ordersSlice';
import stockReducer from './stockSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    banners: bannersReducer,
    orders: ordersReducer,
    stock: stockReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
