import { create } from 'zustand';
import { adminApi } from '@/lib/api-client';
import { 
  ApiProduct, 
  ApiOrder, 
  ApiDashboardStats, 
  OrderStatus,
  ApiCategory,
  ApiBrand,
  ApiHomepageSection,
  ApiAdminSettings
} from '@/lib/api-types';

export type HomepageSection = ApiHomepageSection;

interface AdminState {
  // Stats
  stats: ApiDashboardStats | null;
  
  // Data
  products: ApiProduct[];
  orders: ApiOrder[];
  categories: ApiCategory[];
  brands: ApiBrand[];
  
  // Legacy UI Compatibility (to be replaced by real settings later)
  pcBuilderSettings: {
    showInNav: boolean;
    enabled: boolean;
  };

  // CMS
  homepageLayout: HomepageSection[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchProducts: (params?: Record<string, string | number | boolean>) => Promise<void>;
  fetchOrders: (params?: Record<string, string | number | boolean>) => Promise<void>;
  fetchMetadata: () => Promise<void>;
  
  // Product Mutations
  createProduct: (data: Partial<ApiProduct>) => Promise<void>;
  updateProduct: (id: string, data: Partial<ApiProduct>) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;
  
  // Order Mutations
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  
  // CMS Actions
  fetchHomepage: () => Promise<void>;
  toggleSection: (id: string) => Promise<void>;
  reorderSections: (sections: HomepageSection[]) => Promise<void>;
  updatePCBuilder: (data: Partial<ApiAdminSettings>) => Promise<void>;

  // Helpers
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  products: [],
  orders: [],
  categories: [],
  brands: [],
  pcBuilderSettings: {
    showInNav: true,
    enabled: true,
  },
  homepageLayout: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { stats, recentOrders } = await adminApi.dashboard();
      set({ stats, orders: recentOrders, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch dashboard stats', isLoading: false });
    }
  },

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { products } = await adminApi.getProducts(params);
      set({ products, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch products', isLoading: false });
    }
  },

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { orders } = await adminApi.getOrders(params);
      set({ orders, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch orders', isLoading: false });
    }
  },

  fetchMetadata: async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getBrands()
      ]);
      set({ categories: catRes.categories, brands: brandRes.brands });
    } catch (err) {
      console.error('Failed to fetch admin metadata:', err);
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.createProduct(data);
      await get().fetchProducts();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create product', isLoading: false });
      throw err;
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.updateProduct(id, data);
      await get().fetchProducts();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update product', isLoading: false });
      throw err;
    }
  },

  archiveProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.archiveProduct(id);
      await get().fetchProducts();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to archive product', isLoading: false });
      throw err;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.updateOrderStatus(id, status);
      await get().fetchOrders();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update order status', isLoading: false });
      throw err;
    }
  },

  fetchHomepage: async () => {
    set({ isLoading: true, error: null });
    try {
      const { sections } = await adminApi.getHomepage();
      set({ homepageLayout: sections, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch homepage layout', isLoading: false });
    }
  },

  toggleSection: async (id) => {
    const section = get().homepageLayout.find(s => s.id === id);
    if (!section) return;
    try {
      const { section: updated } = await adminApi.updateSection(id, { isEnabled: !section.isEnabled });
      set({
        homepageLayout: get().homepageLayout.map(s => s.id === id ? updated : s)
      });
    } catch (err) {
      console.error('Failed to toggle section:', err);
    }
  },

  reorderSections: async (sections) => {
    set({ homepageLayout: sections });
  },

  updatePCBuilder: async (data) => {
    try {
      if (data.pc_builder_enabled !== undefined) {
        await adminApi.updateSetting('pc_builder_enabled', data.pc_builder_enabled);
      }
      if (data.pc_builder_show_in_nav !== undefined) {
        await adminApi.updateSetting('pc_builder_show_in_nav', data.pc_builder_show_in_nav);
      }
      set({
        pcBuilderSettings: {
          ...get().pcBuilderSettings,
          enabled: data.pc_builder_enabled ?? get().pcBuilderSettings.enabled,
          showInNav: data.pc_builder_show_in_nav ?? get().pcBuilderSettings.showInNav,
        }
      });
    } catch (err) {
      console.error('Failed to update PC Builder settings:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
