import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Import the action creators from the slice
// We can't import `login` as a thunk because it calls the API.
// Instead, test the reducer by dispatching raw actions matching the fulfilled shape.

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          mustChangePassword: false,
        },
      },
    });
  });

  it('debería tener estado inicial correcto', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.mustChangePassword).toBe(false);
  });

  it('debería manejar login fulfilled', () => {
    const mockUser = {
      id: '1',
      email: 'admin@test.com',
      role: 'admin' as const,
      display_name: 'Admin',
      must_change_password: false,
      phone: null,
    };

    // RTK createAsyncThunk('auth/login') generates action type 'auth/login/fulfilled'
    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: mockUser,
    });

    const state = store.getState().auth;
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.mustChangePassword).toBe(false);
    expect(state.loading).toBe(false);
  });

  it('debería manejar login fulfilled con must_change_password', () => {
    const mockUser = {
      id: '1',
      email: 'admin@test.com',
      role: 'admin' as const,
      display_name: 'Admin',
      must_change_password: true,
      phone: null,
    };

    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: mockUser,
    });

    expect(store.getState().auth.mustChangePassword).toBe(true);
  });

  it('debería manejar login pending', () => {
    store.dispatch({ type: 'auth/login/pending' });
    expect(store.getState().auth.loading).toBe(true);
    expect(store.getState().auth.error).toBeNull();
  });

  it('debería manejar login rejected', () => {
    store.dispatch({
      type: 'auth/login/rejected',
      payload: 'Credenciales inválidas',
    });

    const state = store.getState().auth;
    expect(state.error).toBe('Credenciales inválidas');
    expect(state.loading).toBe(false);
  });

  it('debería manejar logout fulfilled', () => {
    // Primero login
    const mockUser = {
      id: '1',
      email: 'admin@test.com',
      role: 'admin' as const,
      display_name: 'Admin',
      must_change_password: false,
      phone: null,
    };

    store.dispatch({ type: 'auth/login/fulfilled', payload: mockUser });
    expect(store.getState().auth.isAuthenticated).toBe(true);

    // Luego logout
    store.dispatch({ type: 'auth/logout/fulfilled' });

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(false);
  });

  it('debería manejar changePassword fulfilled', () => {
    // Estado con must_change_password true
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: '1', email: 'admin@test.com', role: 'admin' as const, display_name: 'Admin', must_change_password: true, phone: null },
          isAuthenticated: true,
          loading: false,
          error: null,
          mustChangePassword: true,
        },
      },
    });

    store.dispatch({ type: 'auth/changePassword/fulfilled' });

    const state = store.getState().auth;
    expect(state.mustChangePassword).toBe(false);
    expect(state.user?.must_change_password).toBe(false);
  });
});
