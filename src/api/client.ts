import axios, { AxiosError } from 'axios';
import type {
  CategoryResponse,
  ProductResponse,
  BannerResponse,
  PagedProductResponse,
  PagedOrderResponse,
  OrderResponse,
  SessionResponse,
  UserResponse,
  StockAdjustmentResponse,
  UploadUrlResponse,
  ApiErrorResponse,
  CreateAdminUserRequest,
  AdminUserProvisionResponse,
  AdminActivationRequest,
  PasswordChangeRequest,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.merkee.shop/v1';

// Cliente axios base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies HttpOnly
});

// Interceptor para agregar token de acceso (solo en memoria, no se persiste)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Refresh silencioso (single-flight + retry único, sin bucle) ──────────

let refreshPromise: Promise<boolean> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Decodifica la expiración (`exp`) de un JWT de acceso (ms epoch). */
export function decodeAccessTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized)) as { exp?: unknown };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function redirectToLogin(): void {
  if (
    window.location.pathname !== '/login' &&
    !window.location.pathname.startsWith('/activation')
  ) {
    window.location.href = '/login';
  }
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await authApi.refreshToken();
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Programa un refresh proactivo ~60 s antes de la expiración del access token. */
export function scheduleRefresh(token: string): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  const expiry = decodeAccessTokenExpiry(token);
  if (!expiry) return;
  const delay = Math.max(expiry - Date.now() - 60_000, 1_000);
  refreshTimer = setTimeout(() => {
    void tryRefresh();
  }, delay);
}

/** Limpia todo el estado de refresh: timer programado, promise single-flight y token en memoria. */
export function clearRefreshState(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  refreshPromise = null;
  setAccessToken(null);
}

// Interceptor para manejar errores de autenticación con refresh silencioso
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isRefreshCall = typeof original?.url === 'string' && original.url.includes('/auth/refresh');

    if (status === 401 && original && !original._retried && !isRefreshCall) {
      // Reintentar UNA sola vez tras un refresh exitoso (sin bucle).
      original._retried = true;
      const refreshed = await tryRefresh();
      if (refreshed) {
        return apiClient(original);
      }
    }

    if (status === 401) {
      setAccessToken(null);
      redirectToLogin();
    }
    // 403 INITIAL_PASSWORD_CHANGE_REQUIRED se maneja en el AuthGuard
    return Promise.reject(error);
  }
);

// Función para generar Idempotency-Key
export const generateIdempotencyKey = (): string => {
  return crypto.randomUUID();
};

// Función para extraer mensaje de error localizado es-CO
export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (data?.code) return getLocalizedError(data.code);
  }
  return fallback;
};

// Mapa de códigos de error a mensajes localizados es-CO
export const getLocalizedError = (code: string): string => {
  const errors: Record<string, string> = {
    INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
    AUTHENTICATION_REQUIRED: 'Debe iniciar sesión para realizar esta acción',
    INITIAL_PASSWORD_CHANGE_REQUIRED: 'Debe cambiar su contraseña antes de continuar',
    ADMIN_STOREFRONT_PURCHASE_FORBIDDEN: 'Los administradores no pueden realizar compras',
    ACTOR_NOT_AUTHORIZED: 'No tiene permisos para realizar esta acción',
    RESOURCE_NOT_FOUND: 'El recurso solicitado no fue encontrado',
    VERSION_MISMATCH: 'Conflicto de edición: otro usuario modificó este recurso. Actualice y vuelva a intentar',
    CATEGORY_HAS_PRODUCTS: 'No se puede eliminar: la categoría tiene productos asociados',
    IDEMPOTENCY_KEY_REUSED: 'Conflicto de idempotencia: la solicitud ya fue procesada',
    STOCK_INSUFFICIENT: 'Stock insuficiente para realizar esta operación',
    INVALID_DOMAIN_INPUT: 'Los datos enviados no son válidos',
    SESSION_EXPIRED: 'Su sesión ha expirado. Inicie sesión nuevamente',
    CART_RESERVATION_EXPIRED: 'La reserva del producto ha expirado',
    CURRENT_PASSWORD_INVALID: 'La contraseña actual es incorrecta',
    PAYMENT_HOLD_NOT_CONSUMABLE: 'No se puede procesar el pago: reserva no disponible',
    RATE_LIMITED: 'Demasiadas solicitudes. Intente nuevamente en unos minutos',
    TECHNICAL_DEPENDENCY_FAILURE: 'Error del servidor. Intente nuevamente más tarde',
    DUPLICATE_WEBHOOK_EVENT: 'Evento duplicado',
    INVALID_STATE_TRANSITION: 'Transición de estado no válida',
    CHECKOUT_NOT_ALLOWED: 'No se permite el checkout',
    RESERVATION_NOT_ACTIVE: 'La reserva no está activa',
    ACTIVATION_TOKEN_INVALID_OR_EXPIRED: 'El token de activación es inválido o ha expirado',
    PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED: 'El token de restablecimiento es inválido o ha expirado',
  };
  return errors[code] || 'Error desconocido. Intente nuevamente';
};

// API de autenticación
export const authApi = {
  login: async (email: string, password: string): Promise<SessionResponse> => {
    const response = await apiClient.post<SessionResponse>('/auth/login', { email, password });
    setAccessToken(response.data.access_token);
    scheduleRefresh(response.data.access_token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    setAccessToken(null);
    if (refreshTimer) clearTimeout(refreshTimer);
  },

  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/me');
    return response.data;
  },

  refreshToken: async (): Promise<SessionResponse> => {
    const response = await apiClient.post<SessionResponse>('/auth/refresh');
    setAccessToken(response.data.access_token);
    scheduleRefresh(response.data.access_token);
    return response.data;
  },
};

// API de media upload
export const mediaApi = {
  createUploadUrl: async (data: {
    content_type: string;
    content_length: number;
  }): Promise<UploadUrlResponse> => {
    const response = await apiClient.post<UploadUrlResponse>('/media/upload-urls', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    return response.data;
  },
};

// API de categorías (admin)
export const categoriesApi = {
  list: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>('/admin/categories');
    return response.data;
  },

  create: async (data: { name: string; image_key: string }): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/admin/categories', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    return response.data;
  },

  update: async (
    id: string,
    data: { name: string; image_key: string },
    version: number
  ): Promise<CategoryResponse> => {
    const response = await apiClient.patch<CategoryResponse>(`/admin/categories/${id}`, data, {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
        'If-Match': version.toString(),
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
  },
};

// API de productos (admin)
export const productsApi = {
  list: async (page = 1, size = 20): Promise<PagedProductResponse> => {
    const response = await apiClient.get<PagedProductResponse>('/admin/products', {
      params: { page, size },
    });
    return response.data;
  },

  create: async (data: {
    category_id: string;
    name: string;
    description: string;
    regular_price_cop: number;
    sale_price_cop: number;
    unit: string;
    stock_on_hand: number;
    images: Array<{ key: string; alt_text: string; position: number }>;
  }): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>('/admin/products', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    return response.data;
  },

  update: async (
    id: string,
    data: {
      category_id: string;
      name: string;
      description: string;
      regular_price_cop: number;
      sale_price_cop: number;
      unit: string;
      images: Array<{ key: string; alt_text: string; position: number }>;
    },
    version: number
  ): Promise<ProductResponse> => {
    const response = await apiClient.patch<ProductResponse>(`/admin/products/${id}`, data, {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
        'If-Match': version.toString(),
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
  },
};

// API de stock (admin)
export const stockApi = {
  createAdjustment: async (
    productId: string,
    data: { quantity_delta: number; reason: string }
  ): Promise<StockAdjustmentResponse> => {
    const response = await apiClient.post<StockAdjustmentResponse>(
      `/admin/products/${productId}/stock-adjustments`,
      data,
      {
        headers: { 'Idempotency-Key': generateIdempotencyKey() },
      }
    );
    return response.data;
  },
};

// API de banners (admin)
export const bannersApi = {
  list: async (): Promise<BannerResponse[]> => {
    const response = await apiClient.get<BannerResponse[]>('/admin/banners');
    return response.data;
  },

  create: async (data: {
    name: string;
    image_key: string;
    display_order: number;
    active: boolean;
    target_path?: string | null;
  }): Promise<BannerResponse> => {
    const response = await apiClient.post<BannerResponse>('/admin/banners', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name: string;
      image_key: string;
      display_order: number;
      active: boolean;
      target_path?: string | null;
    },
    version: number
  ): Promise<BannerResponse> => {
    const response = await apiClient.patch<BannerResponse>(`/admin/banners/${id}`, data, {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
        'If-Match': version.toString(),
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
  },
};

// API de órdenes (admin, solo lectura)
export const ordersApi = {
  list: async (page = 1, size = 20, status?: string): Promise<PagedOrderResponse> => {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const response = await apiClient.get<PagedOrderResponse>('/admin/orders', { params });
    return response.data;
  },

  get: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/admin/orders/${id}`);
    return response.data;
  },
};

// API de administración de usuarios admin (provisión)
export const adminUsersApi = {
  provision: async (data: CreateAdminUserRequest): Promise<AdminUserProvisionResponse> => {
    const response = await apiClient.post<AdminUserProvisionResponse>('/admin/users', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    return response.data;
  },
};

// API de activación de admin (pública, sin auth)
export const activationApi = {
  activate: async (data: AdminActivationRequest): Promise<void> => {
    await apiClient.post('/auth/admin-activations', data);
  },
};

// API de cambio de contraseña
export const passwordApi = {
  change: async (data: PasswordChangeRequest): Promise<void> => {
    await apiClient.post('/auth/password-change', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
  },
};

export default apiClient;
