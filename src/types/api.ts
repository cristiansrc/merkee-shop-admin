// Tipos derivados del OpenAPI de merkee.shop
// Fuente: /home/cristiansrc/Documentos/Proyectos/merkee-workspace/docs/api/openapi.yaml

export interface ImageResponse {
  key: string;
  url: string;
  alt_text: string;
  position: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  image: ImageResponse;
  version: number;
}

export interface ProductResponse {
  id: string;
  category: CategoryResponse;
  name: string;
  description: string;
  regular_price_cop: number;
  sale_price_cop: number;
  unit: string;
  stock_available: number;
  images: ImageResponse[];
  version: number;
}

export interface BannerResponse {
  id: string;
  name: string;
  image: ImageResponse;
  target_path: string | null;
  display_order: number;
  active: boolean;
  version: number;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
}

export interface PagedProductResponse {
  items: ProductResponse[];
  page: PageMeta;
}

export interface OrderItemResponse {
  product_id: string | null;
  product_name: string;
  unit: string;
  unit_price_cop: number;
  quantity: number;
  subtotal_cop: number;
}

export interface PaymentResponse {
  id: string;
  provider: 'WOMPI' | 'MERCADO_PAGO';
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'EXPIRED' | 'REFUNDED' | 'REFUND_FAILED';
  amount_cop: number;
  provider_reference: string | null;
}

export interface PaymentRefundResponse {
  id: string;
  status: 'PENDING' | 'REFUNDED' | 'REFUND_FAILED';
  amount_cop: number;
  provider_refund_reference: string | null;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PAYMENT_FAILED' | 'PAYMENT_EXPIRED' | 'RESERVATION_EXPIRED' | 'PAYMENT_REFUND_PENDING' | 'PAYMENT_REFUNDED' | 'PAYMENT_REFUND_FAILED';
  items_subtotal_cop: number;
  delivery_fee_cop: number;
  iva_cop: number;
  tax_rate_basis_points: number;
  total_cop: number;
  items: OrderItemResponse[];
  delivery_recipient_name: string;
  delivery_line1: string;
  delivery_city: string;
  delivery_phone: string;
  payment: PaymentResponse;
  refund: PaymentRefundResponse | null;
  created_at: string;
}

export interface PagedOrderResponse {
  items: OrderResponse[];
  page: PageMeta;
}

export interface UserResponse {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'cliente';
  must_change_password: boolean;
  phone: string | null;
}

export interface SessionResponse {
  access_token: string;
  expires_at: string;
  user: UserResponse;
}

export interface ApiErrorDetail {
  field: string;
  reason: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  trace_id: string;
  details?: ApiErrorDetail[];
}

export interface StockAdjustmentResponse {
  id: string;
  product_id: string;
  quantity_delta: number;
  reason: string;
  stock_on_hand_before: number;
  stock_on_hand_after: number;
  stock_reserved: number;
  stock_available: number;
  created_at: string;
}

export interface UploadUrlResponse {
  key: string;
  upload_url: string;
  expires_at: string;
}

// --- Admin provisioning / activation / password-change ---

export interface CreateAdminUserRequest {
  display_name: string;
  email: string;
  phone?: string | null;
}

export interface AdminUserProvisionResponse {
  id: string;
  display_name: string;
  email: string;
  role: 'admin';
  must_change_password: true;
  phone: string | null;
  activation_expires_at: string;
}

export interface AdminActivationRequest {
  token: string;
  new_password: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export type OrderStatus = OrderResponse['status'];
export type PaymentStatus = PaymentResponse['status'];
