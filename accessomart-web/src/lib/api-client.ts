// =============================================================================
// ACCESSOMART — FRONTEND API CLIENT
// Typed Axios client that connects to the accessomart-api backend.
// Replace Zustand mock data calls with these functions progressively.
// =============================================================================

import {
  AuthResponse, ApiUser, ApiCustomer, ApiProduct, ApiCart, ApiCartItem,
  ApiOrder, ApiCategory, ApiPCBuild, ApiDashboardStats,
  ApiHomepageSection, ApiAdminSettings, ApiAddress, ApiWishlistItem,
  ApiError, ApiBrand, ApiProductImage, ApiInventoryItem
} from './api-types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ─── Token Management ─────────────────────────────────────────────────────────

const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if not sending FormData (browser handles boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry with new token
      return apiFetch<T>(endpoint, options);
    }
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  // Handle rate limiting (429)
  if (res.status === 429) {
    const data: unknown = await res.json().catch(() => ({}));
    throw new Error(((data as ApiError)?.error) || 'Too many requests. Please wait a moment before trying again.');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data: unknown = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const errorObj = data as { error?: string; message?: string } | null;
    const errorMessage = errorObj?.error || errorObj?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }
  return data as T;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const { accessToken, refreshToken: newRefresh } = (await res.json()) as { accessToken: string; refreshToken: string };
    setTokens(accessToken, newRefresh);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// AUTH API
// =============================================================================

export const authApi = {
  register: (data: {
    firstName: string; lastName: string;
    email: string; password: string;
  }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => { setTokens(r.accessToken, r.refreshToken); return r; }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(r => { setTokens(r.accessToken, r.refreshToken); return r; }),

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => { });
    clearTokens();
  },

  me: () => apiFetch<{ user: ApiUser }>('/auth/me'),
};

// =============================================================================
// PRODUCTS API
// =============================================================================

export const productsApi = {
  list: (params?: {
    category?: string; brand?: string; search?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    minPrice?: number; maxPrice?: number;
    page?: number; limit?: number; featured?: boolean;
  }): Promise<{ products: ApiProduct[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    const q = new URLSearchParams();
    if (params) {
      (Object.entries(params) as [string, string | number | boolean | undefined][]).forEach(([k, v]) => {
        if (v !== undefined) q.set(k, String(v));
      });
    }
    return apiFetch<{ products: ApiProduct[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/products?${q}`);
  },

  get: (slug: string) =>
    apiFetch<{ product: ApiProduct }>(`/products/${slug}`),

  // Admin
  create: (data: Partial<ApiProduct>) =>
    apiFetch<{ product: ApiProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ApiProduct>) =>
    apiFetch<{ product: ApiProduct }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  archive: (id: string) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

// =============================================================================
// CART API
// =============================================================================

export const cartApi = {
  get: () => apiFetch<ApiCart>('/cart'),

  addItem: (variantId: string, quantity = 1) =>
    apiFetch<{ item: ApiCartItem }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity }),
    }),

  updateItem: (itemId: string, quantity: number) =>
    apiFetch<{ item: ApiCartItem }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: () => apiFetch('/cart', { method: 'DELETE' }),
};

// =============================================================================
// ORDERS API
// =============================================================================

export const ordersApi = {
  list: () => apiFetch<{ orders: ApiOrder[] }>('/orders'),

  get: (id: string) => apiFetch<{ order: ApiOrder }>(`/orders/${id}`),

  checkout: (data: {
    addressId?: string;
    addressData?: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentProvider?: 'STRIPE' | 'PAYPAL' | 'COD';
    couponCode?: string;
    notes?: string;
  }) =>
    apiFetch<{ order: ApiOrder; clientSecret?: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmPayment: (id: string) =>
    apiFetch<{ success: boolean; order: ApiOrder }>(`/orders/${id}/confirm-payment`, {
      method: 'POST',
    }),

  confirmPaypalPayment: (id: string, paypalOrderId: string) =>
    apiFetch<{ success: boolean; order: ApiOrder }>(`/orders/${id}/capture-paypal`, {
      method: 'POST',
      body: JSON.stringify({ paypalOrderId }),
    }),
};

// =============================================================================
// ADDRESSES API
// =============================================================================

export const addressApi = {
  list: () => apiFetch<{ addresses: ApiAddress[] }>('/addresses'),
  create: (data: Partial<ApiAddress>) =>
    apiFetch<{ address: ApiAddress }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ApiAddress>) =>
    apiFetch<{ address: ApiAddress }>(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/addresses/${id}`, { method: 'DELETE' }),
};

// =============================================================================
// PC BUILDER API
// =============================================================================

export const builderApi = {
  getComponents: () =>
    apiFetch<{ categories: ApiCategory[] }>('/builder/components'),

  getMyBuilds: () =>
    apiFetch<{ builds: ApiPCBuild[] }>('/builder/my-builds'),

  save: (data: {
    name: string;
    components: { category: string; variantId: string; productId: string; quantity: number }[];
    totalPrice: number;
    compatibilityWarnings?: string[];
  }) =>
    apiFetch<{ build: ApiPCBuild }>('/builder/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/builder/${id}`, { method: 'DELETE' }),
};

// =============================================================================
// ADMIN API
// =============================================================================

export const adminApi = {
  dashboard: () =>
    apiFetch<{ stats: ApiDashboardStats; recentOrders: ApiOrder[]; lowStockItems: ApiInventoryItem[] }>(
      '/admin/dashboard'
    ),

  getHomepage: () =>
    apiFetch<{ sections: ApiHomepageSection[] }>('/admin/homepage'),

  updateSection: (id: string, data: Partial<ApiHomepageSection>) =>
    apiFetch<{ section: ApiHomepageSection }>(`/admin/homepage/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getSettings: () =>
    apiFetch<{ settings: ApiAdminSettings }>('/admin/settings'),

  updateSetting: (key: string, value: any) =>
    apiFetch(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  getOrders: (params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>);
    return apiFetch<{ orders: ApiOrder[]; total: number }>(`/admin/orders?${q}`);
  },

  getCustomers: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>);
    return apiFetch<{ customers: ApiCustomer[] }>(`/admin/customers?${q}`);
  },

  // Product Management
  getProducts: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
    brandId?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams(params as Record<string, string>);
    return apiFetch<{ products: ApiProduct[]; total: number }>(`/admin/products?${q}`);
  },

  getProduct: (id: string) =>
    apiFetch<{ product: ApiProduct }>(`/admin/products/${id}`),

  createProduct: (data: Partial<ApiProduct>) =>
    apiFetch<{ product: ApiProduct }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<ApiProduct>) =>
    apiFetch<{ product: ApiProduct }>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  archiveProduct: (id: string) =>
    apiFetch<{ message: string; product: ApiProduct }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getBrands: () =>
    apiFetch<{ brands: ApiBrand[] }>('/admin/brands'),

  createBrand: (data: Partial<ApiBrand>) =>
    apiFetch<{ brand: ApiBrand }>('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBrand: (id: string, data: Partial<ApiBrand>) =>
    apiFetch<{ brand: ApiBrand }>(`/admin/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getCategories: () =>
    apiFetch<{ categories: ApiCategory[] }>('/admin/categories'),

  createCategory: (data: Partial<ApiCategory>) =>
    apiFetch<{ category: ApiCategory }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: Partial<ApiCategory>) =>
    apiFetch<{ category: ApiCategory }>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Variant Management
  createVariant: (data: Record<string, unknown>) =>
    apiFetch<{ variant: unknown }>('/admin/variants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVariant: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ variant: unknown }>(`/admin/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Inventory Management
  updateInventory: (variantId: string, data: { quantity: number; operation: 'set' | 'adjust' }) =>
    apiFetch<{ inventory: unknown }>(`/admin/inventory/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getInventory: () =>
    apiFetch<{ inventoryItems: ApiInventoryItem[] }>('/admin/inventory'),

  getLowStock: () =>
    apiFetch<{ lowStockItems: ApiInventoryItem[] }>('/admin/inventory/low-stock'),

  // Order Management
  // updateOrderStatus and getCustomer are handled by their respective resource sections if needed, 
  // but let's keep them here for now if they are admin-specific.

  updateOrderStatus: (id: string, status: string) =>
    apiFetch<{ order: ApiOrder }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getCustomer: (id: string) =>
    apiFetch<{ customer: ApiCustomer }>(`/admin/customers/${id}`),

  // Image Management
  uploadImages: (productId: string, filesOrFormData: File[] | FormData) => {
    let formData: FormData;
    
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData;
    } else {
      formData = new FormData();
      filesOrFormData.forEach(file => formData.append('images', file));
    }
    
    return apiFetch<{ images: ApiProductImage[] }>(`/admin/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteImage: (productId: string, imageId: string) =>
    apiFetch(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    }),

  setPrimaryImage: (productId: string, imageId: string) =>
    apiFetch<{ image: ApiProductImage }>(`/admin/products/${productId}/images/${imageId}/primary`, {
      method: 'PATCH',
    }),
};

// =============================================================================
// WISHLIST API
// =============================================================================

export const wishlistApi = {
  get: () => apiFetch<{ wishlist: ApiWishlistItem[] }>('/wishlist'),
  add: (productId: string) =>
    apiFetch<{ item: ApiWishlistItem }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    apiFetch(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// =============================================================================
// CATEGORIES API
// =============================================================================

export const categoriesApi = {
  list: () => apiFetch<{ categories: ApiCategory[] }>('/categories'),
};
