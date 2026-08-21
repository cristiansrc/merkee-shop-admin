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
  AdminUserProvisionResponse,
  CreateAdminUserRequest,
  AdminActivationRequest,
  PasswordChangeRequest,
} from '../../types/api';

// Mock data para desarrollo offline
const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-001',
    name: 'Frutas y Verduras',
    image: { key: 'cat-frutas', url: 'https://placehold.co/400x300?text=Frutas', alt_text: 'Frutas y verduras', position: 0 },
    version: 1,
  },
  {
    id: 'cat-002',
    name: 'Lácteos',
    image: { key: 'cat-lacteos', url: 'https://placehold.co/400x300?text=Lácteos', alt_text: 'Lácteos', position: 1 },
    version: 1,
  },
  {
    id: 'cat-003',
    name: 'Carnes',
    image: { key: 'cat-carnes', url: 'https://placehold.co/400x300?text=Carnes', alt_text: 'Carnes', position: 2 },
    version: 1,
  },
  {
    id: 'cat-004',
    name: 'Abarrotes',
    image: { key: 'cat-abarrotes', url: 'https://placehold.co/400x300?text=Abarrotes', alt_text: 'Abarrotes', position: 3 },
    version: 1,
  },
];

const mockProducts: ProductResponse[] = [
  {
    id: 'prod-001',
    category: mockCategories[0],
    name: 'Manzana Roja',
    description: 'Manzana roja fresca de Boyacá, 1 kg.',
    regular_price_cop: 8500,
    sale_price_cop: 7900,
    unit: 'kg',
    stock_available: 150,
    images: [{ key: 'img-manzana', url: 'https://placehold.co/600x400?text=Manzana', alt_text: 'Manzana roja', position: 0 }],
    version: 1,
  },
  {
    id: 'prod-002',
    category: mockCategories[1],
    name: 'Leche Entera',
    description: 'Leche entera pasteurizada, 1 litro.',
    regular_price_cop: 4200,
    sale_price_cop: 4200,
    unit: 'litro',
    stock_available: 200,
    images: [{ key: 'img-leche', url: 'https://placehold.co/600x400?text=Leche', alt_text: 'Leche entera', position: 0 }],
    version: 1,
  },
  {
    id: 'prod-003',
    category: mockCategories[2],
    name: 'Pechuga de Pollo',
    description: 'Pechuga de pollo sin hueso, 500 g.',
    regular_price_cop: 15800,
    sale_price_cop: 14900,
    unit: '500g',
    stock_available: 80,
    images: [{ key: 'img-pechuga', url: 'https://placehold.co/600x400?text=Pechuga', alt_text: 'Pechuga de pollo', position: 0 }],
    version: 1,
  },
  {
    id: 'prod-004',
    category: mockCategories[3],
    name: 'Arroz Premium',
    description: 'Arroz graneado premium, 1 kg.',
    regular_price_cop: 5600,
    sale_price_cop: 5200,
    unit: 'kg',
    stock_available: 300,
    images: [{ key: 'img-arroz', url: 'https://placehold.co/600x400?text=Arroz', alt_text: 'Arroz premium', position: 0 }],
    version: 1,
  },
];

const mockBanners: BannerResponse[] = [
  {
    id: 'banner-001',
    name: 'Ofertas de la semana',
    image: { key: 'banner-ofertas', url: 'https://placehold.co/1200x400?text=Ofertas', alt_text: 'Ofertas de la semana', position: 0 },
    target_path: '/ofertas',
    display_order: 0,
    active: true,
    version: 1,
  },
  {
    id: 'banner-002',
    name: 'Frutas frescas',
    image: { key: 'banner-frutas', url: 'https://placehold.co/1200x400?text=Frutas+Frescas', alt_text: 'Frutas frescas del campo', position: 1 },
    target_path: '/categorias/frutas',
    display_order: 1,
    active: true,
    version: 1,
  },
];

const mockOrders: OrderResponse[] = [
  {
    id: 'order-001',
    order_number: 'ORD-2026-001',
    status: 'PAID',
    items_subtotal_cop: 22700,
    delivery_fee_cop: 5000,
    iva_cop: 4313,
    tax_rate_basis_points: 1900,
    total_cop: 32013,
    items: [
      { product_id: 'prod-001', product_name: 'Manzana Roja', unit: 'kg', unit_price_cop: 7900, quantity: 2, subtotal_cop: 15800 },
      { product_id: 'prod-002', product_name: 'Leche Entera', unit: 'litro', unit_price_cop: 4200, quantity: 1, subtotal_cop: 4200 },
    ],
    delivery_recipient_name: 'Juan Pérez',
    delivery_line1: 'Calle 123 #45-67',
    delivery_city: 'Bogotá',
    delivery_phone: '3001234567',
    payment: { id: 'pay-001', provider: 'WOMPI', status: 'APPROVED', amount_cop: 32013, provider_reference: 'wompi-ref-001' },
    refund: null,
    created_at: '2026-08-17T10:30:00Z',
  },
  {
    id: 'order-002',
    order_number: 'ORD-2026-002',
    status: 'PENDING_PAYMENT',
    items_subtotal_cop: 15800,
    delivery_fee_cop: 5000,
    iva_cop: 3002,
    tax_rate_basis_points: 1900,
    total_cop: 23802,
    items: [
      { product_id: 'prod-003', product_name: 'Pechuga de Pollo', unit: '500g', unit_price_cop: 14900, quantity: 1, subtotal_cop: 14900 },
    ],
    delivery_recipient_name: 'María García',
    delivery_line1: 'Avenida 456 #78-90',
    delivery_city: 'Medellín',
    delivery_phone: '3109876543',
    payment: { id: 'pay-002', provider: 'WOMPI', status: 'PENDING', amount_cop: 23802, provider_reference: null },
    refund: null,
    created_at: '2026-08-17T14:15:00Z',
  },
];

const mockUser: UserResponse = {
  id: 'admin-001',
  display_name: 'Administrador',
  email: 'admin@merkee.shop',
  role: 'admin',
  must_change_password: false,
  phone: null,
};

// Simular delay de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper para generar UUID mock
const generateId = () => `mock-${crypto.randomUUID()}`;

// Mock API completa con CRUD
export const mockApi = {
  auth: {
    login: async (email: string, _password: string): Promise<SessionResponse> => {
      await delay(800);
      if (email === 'admin@merkee.shop') {
        return {
          access_token: 'mock-jwt-token',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          user: mockUser,
        };
      }
      throw { response: { status: 401, data: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } } };
    },

    getProfile: async (): Promise<UserResponse> => {
      await delay(300);
      return mockUser;
    },

    refreshToken: async (): Promise<SessionResponse> => {
      await delay(300);
      return {
        access_token: 'mock-jwt-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        user: mockUser,
      };
    },

    logout: async (): Promise<void> => {
      await delay(200);
    },
  },

  media: {
    createUploadUrl: async (_data: { content_type: string; content_length: number }): Promise<UploadUrlResponse> => {
      await delay(400);
      const key = `media/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${generateId()}.jpg`;
      return {
        key,
        upload_url: `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Security-Token=mock`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    },
  },

  categories: {
    list: async (): Promise<CategoryResponse[]> => {
      await delay(500);
      return [...mockCategories];
    },

    create: async (data: { name: string; image_key: string }): Promise<CategoryResponse> => {
      await delay(600);
      const newCategory: CategoryResponse = {
        id: generateId(),
        name: data.name,
        image: { key: data.image_key, url: `https://placehold.co/400x300?text=${encodeURIComponent(data.name)}`, alt_text: data.name, position: mockCategories.length },
        version: 1,
      };
      mockCategories.push(newCategory);
      return newCategory;
    },

    update: async (id: string, data: { name: string; image_key: string }, version: number): Promise<CategoryResponse> => {
      await delay(600);
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Categoría no encontrada' } } };
      }
      if (mockCategories[index].version !== version) {
        throw { response: { status: 409, data: { code: 'VERSION_MISMATCH', message: 'Conflicto de edición: otro usuario modificó este recurso' } } };
      }
      mockCategories[index] = {
        ...mockCategories[index],
        name: data.name,
        image: { ...mockCategories[index].image, key: data.image_key, url: `https://placehold.co/400x300?text=${encodeURIComponent(data.name)}` },
        version: version + 1,
      };
      return mockCategories[index];
    },

    delete: async (id: string): Promise<void> => {
      await delay(500);
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Categoría no encontrada' } } };
      }
      const hasProducts = mockProducts.some((p) => p.category.id === id);
      if (hasProducts) {
        throw { response: { status: 409, data: { code: 'CATEGORY_HAS_PRODUCTS', message: 'No se puede eliminar: la categoría tiene productos asociados' } } };
      }
      mockCategories.splice(index, 1);
    },
  },

  products: {
    list: async (page = 1, size = 20): Promise<PagedProductResponse> => {
      await delay(600);
      const start = (page - 1) * size;
      const items = mockProducts.slice(start, start + size);
      return {
        items,
        page: { page, size, total: mockProducts.length },
      };
    },

    create: async (data: any): Promise<ProductResponse> => {
      await delay(700);
      const category = mockCategories.find((c) => c.id === data.category_id);
      if (!category) {
        throw { response: { status: 400, data: { code: 'INVALID_DOMAIN_INPUT', message: 'Categoría inválida' } } };
      }
      const newProduct: ProductResponse = {
        id: generateId(),
        category,
        name: data.name,
        description: data.description,
        regular_price_cop: data.regular_price_cop,
        sale_price_cop: data.sale_price_cop,
        unit: data.unit,
        stock_available: data.stock_on_hand || 0,
        images: data.images?.map((img: any, i: number) => ({
          key: img.key,
          url: `https://placehold.co/600x400?text=${encodeURIComponent(data.name)}`,
          alt_text: img.alt_text || data.name,
          position: img.position ?? i,
        })) || [],
        version: 1,
      };
      mockProducts.push(newProduct);
      return newProduct;
    },

    update: async (id: string, data: any, version: number): Promise<ProductResponse> => {
      await delay(700);
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Producto no encontrado' } } };
      }
      if (mockProducts[index].version !== version) {
        throw { response: { status: 409, data: { code: 'VERSION_MISMATCH', message: 'Conflicto de edición: otro usuario modificó este recurso' } } };
      }
      const category = mockCategories.find((c) => c.id === data.category_id);
      if (!category) {
        throw { response: { status: 400, data: { code: 'INVALID_DOMAIN_INPUT', message: 'Categoría inválida' } } };
      }
      mockProducts[index] = {
        ...mockProducts[index],
        category,
        name: data.name,
        description: data.description,
        regular_price_cop: data.regular_price_cop,
        sale_price_cop: data.sale_price_cop,
        unit: data.unit,
        images: data.images?.map((img: any, i: number) => ({
          key: img.key,
          url: `https://placehold.co/600x400?text=${encodeURIComponent(data.name)}`,
          alt_text: img.alt_text || data.name,
          position: img.position ?? i,
        })) || mockProducts[index].images,
        version: version + 1,
      };
      return mockProducts[index];
    },

    delete: async (id: string): Promise<void> => {
      await delay(500);
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Producto no encontrado' } } };
      }
      // Soft delete: remove from active list
      mockProducts.splice(index, 1);
    },
  },

  stock: {
    createAdjustment: async (
      productId: string,
      data: { quantity_delta: number; reason: string }
    ): Promise<StockAdjustmentResponse> => {
      await delay(600);
      const product = mockProducts.find((p) => p.id === productId);
      if (!product) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Producto no encontrado' } } };
      }
      if (data.quantity_delta === 0) {
        throw { response: { status: 400, data: { code: 'INVALID_DOMAIN_INPUT', message: 'El delta de cantidad no puede ser cero' } } };
      }
      const before = product.stock_available;
      const after = before + data.quantity_delta;
      if (after < 0) {
        throw { response: { status: 422, data: { code: 'STOCK_INSUFFICIENT', message: 'Stock insuficiente: el resultado no puede ser negativo' } } };
      }
      product.stock_available = after;
      return {
        id: generateId(),
        product_id: productId,
        quantity_delta: data.quantity_delta,
        reason: data.reason,
        stock_on_hand_before: before,
        stock_on_hand_after: after,
        stock_reserved: 0,
        stock_available: after,
        created_at: new Date().toISOString(),
      };
    },
  },

  banners: {
    list: async (): Promise<BannerResponse[]> => {
      await delay(400);
      return [...mockBanners];
    },

    create: async (data: any): Promise<BannerResponse> => {
      await delay(600);
      const newBanner: BannerResponse = {
        id: generateId(),
        name: data.name,
        image: { key: data.image_key, url: `https://placehold.co/1200x400?text=${encodeURIComponent(data.name)}`, alt_text: data.name, position: mockBanners.length },
        target_path: data.target_path || null,
        display_order: data.display_order,
        active: data.active,
        version: 1,
      };
      mockBanners.push(newBanner);
      return newBanner;
    },

    update: async (id: string, data: any, version: number): Promise<BannerResponse> => {
      await delay(600);
      const index = mockBanners.findIndex((b) => b.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Banner no encontrado' } } };
      }
      if (mockBanners[index].version !== version) {
        throw { response: { status: 409, data: { code: 'VERSION_MISMATCH', message: 'Conflicto de edición: otro usuario modificó este recurso' } } };
      }
      mockBanners[index] = {
        ...mockBanners[index],
        name: data.name,
        image: { ...mockBanners[index].image, key: data.image_key, url: `https://placehold.co/1200x400?text=${encodeURIComponent(data.name)}` },
        target_path: data.target_path || null,
        display_order: data.display_order,
        active: data.active,
        version: version + 1,
      };
      return mockBanners[index];
    },

    delete: async (id: string): Promise<void> => {
      await delay(500);
      const index = mockBanners.findIndex((b) => b.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Banner no encontrado' } } };
      }
      mockBanners.splice(index, 1);
    },
  },

  orders: {
    list: async (page = 1, size = 20): Promise<PagedOrderResponse> => {
      await delay(700);
      const start = (page - 1) * size;
      const items = mockOrders.slice(start, start + size);
      return {
        items,
        page: { page, size, total: mockOrders.length },
      };
    },

    get: async (id: string): Promise<OrderResponse> => {
      await delay(400);
      const order = mockOrders.find((o) => o.id === id);
      if (!order) throw { response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND', message: 'Pedido no encontrado' } } };
      return { ...order };
    },
  },

  adminUsers: {
    provision: async (data: CreateAdminUserRequest): Promise<AdminUserProvisionResponse> => {
      await delay(600);
      const newAdmin: AdminUserProvisionResponse = {
        id: generateId(),
        display_name: data.display_name,
        email: data.email,
        role: 'admin',
        must_change_password: true,
        phone: data.phone || null,
        activation_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      return newAdmin;
    },
  },

  activation: {
    activate: async (data: AdminActivationRequest): Promise<void> => {
      await delay(800);
      if (data.token.length < 32) {
        throw { response: { status: 422, data: { code: 'ACTIVATION_TOKEN_INVALID_OR_EXPIRED', message: 'Token inválido o expirado' } } };
      }
      // Simular éxito
    },
  },

  password: {
    change: async (data: PasswordChangeRequest): Promise<void> => {
      await delay(600);
      if (data.current_password === 'wrong') {
        throw { response: { status: 422, data: { code: 'CURRENT_PASSWORD_INVALID', message: 'Contraseña actual incorrecta' } } };
      }
      // Simular éxito
    },
  },
};

export default mockApi;
