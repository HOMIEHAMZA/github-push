// =============================================================================
// ACCESSOMART — FRONTEND API TYPES
// These match the backend's Prisma model shapes and API response contracts.
// Replace mock data interfaces with these when connecting to the real backend.
// =============================================================================

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SELLER';

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING'
  | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING' | 'AUTHORIZED' | 'CAPTURED'
  | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

// ─── USER ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface ApiCustomer extends ApiUser {
  isActive: boolean;
  _count: {
    orders: number;
  };
}

export interface ApiAddress {
  id: string;
  userId: string;
  label?: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phone?: string;
}

export interface ApiWishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: ApiProduct;
}

// ─── AUTH RESPONSES ───────────────────────────────────────────────────────────

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  children?: ApiCategory[];
}

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export interface ApiProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ApiProductSpec {
  id: string;
  groupName?: string;
  specKey: string;
  specValue: string;
  sortOrder: number;
}

export interface ApiInventory {
  quantity: number;
  reservedQty: number;
  lowStockThreshold: number;
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  color?: string | null;
  size?: string | null;
  model?: string | null;
  isDefault: boolean;
  attributes: Record<string, string | number | boolean | null>;
  imageUrl?: string | null;
  isActive: boolean;
  inventory?: ApiInventory;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  basePrice: number;
  comparePrice?: number;
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  brand?: ApiBrand;
  category?: ApiCategory;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  specs?: ApiProductSpec[];
  reviews?: ApiReview[];
  _count?: { reviews: number };
  createdAt: string;
  updatedAt?: string;
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { firstName: string; lastName: string; avatarUrl?: string };
}

// ─── CART ─────────────────────────────────────────────────────────────────────

export interface ApiCartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  buildId?: string;
  variant: ApiProductVariant & {
    product: Pick<ApiProduct, 'id' | 'name' | 'slug' | 'images'> & { brand?: ApiBrand };
  };
}

export interface ApiCart {
  id: string;
  userId?: string;
  items: ApiCartItem[];
  total: number;
  couponCode?: string;
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export interface ApiOrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  variantName: string;
  imageUrl?: string;
  variant?: ApiProductVariant & {
    product: Pick<ApiProduct, 'id' | 'name' | 'slug'>;
  };
}

export interface ApiPayment {
  id: string;
  provider: 'STRIPE' | 'PAYPAL' | 'COD';
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  items: ApiOrderItem[];
  address?: ApiAddress;
  payment?: ApiPayment;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    items: number;
  };
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// ─── PC BUILDER ───────────────────────────────────────────────────────────────

export interface ApiPCBuildItem {
  id: string;
  category: string;
  variantId: string;
  productId: string;
  quantity: number;
  variant?: ApiProductVariant & {
    product: Pick<ApiProduct, 'id' | 'name' | 'images'>;
  };
}

export interface ApiPCBuild {
  id: string;
  userId?: string;
  name: string;
  totalPrice: number;
  isSaved: boolean;
  isPublic: boolean;
  compatibilityWarnings: string[];
  items: ApiPCBuildItem[];
  createdAt: string;
}

// ─── CMS ──────────────────────────────────────────────────────────────────────

export type SectionType =
  | 'HERO' | 'CATEGORIES' | 'FLASH_DEALS'
  | 'FEATURED_PRODUCTS' | 'PROMO_BANNER' | 'NEWSLETTER' | 'CUSTOM';

export interface ApiHomepageSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  isEnabled: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface ApiDashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
}

export interface ApiAdminSettings {
  pc_builder_enabled: boolean;
  pc_builder_show_in_nav: boolean;
  site_maintenance_mode: boolean;
  [key: string]: unknown;
}

// ─── GENERIC RESPONSES ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

export interface ApiInventoryItem {
  id: string;
  variantId: string;
  quantity: number;
  lowStockThreshold: number;
  variant: {
    id: string;
    sku: string;
    name: string;
    product: {
      id: string;
      name: string;
      brand: { name: string } | null;
    };
  };
}
