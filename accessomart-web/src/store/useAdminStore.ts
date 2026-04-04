import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HomepageSection = 'hero' | 'categories' | 'flash' | 'featured' | 'promo' | 'newsletter';

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: 'active' | 'draft' | 'archived';
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
}

interface AdminState {
  // Homepage Layout
  homepageLayout: { id: HomepageSection; enabled: boolean }[];
  
  // PC Builder Settings
  pcBuilderSettings: {
    enabled: boolean;
    showInNav: boolean;
  };
  
  // Product Management (Mock)
  products: AdminProduct[];
  
  // Order Management (Mock)
  orders: AdminOrder[];

  // Actions
  reorderSections: (newLayout: { id: HomepageSection; enabled: boolean }[]) => void;
  toggleSection: (id: HomepageSection) => void;
  updatePCBuilder: (settings: Partial<AdminState['pcBuilderSettings']>) => void;
  
  // Product Actions
  addProduct: (product: Omit<AdminProduct, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  
  // Order Actions
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      homepageLayout: [
        { id: 'hero', enabled: true },
        { id: 'categories', enabled: true },
        { id: 'flash', enabled: true },
        { id: 'promo', enabled: true },
        { id: 'featured', enabled: true },
        { id: 'newsletter', enabled: true },
      ],
      pcBuilderSettings: {
        enabled: true,
        showInNav: true,
      },
      products: [
        { id: 'p1', name: 'Obsidian Ghost K1', brand: 'Vanguard', category: 'Keyboards', price: 219.00, stock: 45, status: 'active', imageUrl: '/images/keyboard.png' },
        { id: 'p2', name: 'SonicBlast H3', brand: 'AeroFlow', category: 'Audio', price: 159.00, stock: 32, status: 'active', imageUrl: '/images/headset.png' },
        { id: 'p3', name: 'SwiftGlide X', brand: 'Reflex', category: 'Mice', price: 79.00, stock: 120, status: 'active', imageUrl: '/images/mouse.png' },
      ],
      orders: [
        { id: 'ORD-2024-001', customerName: 'Alex Thorne', date: '2024-03-28', total: 2450.00, status: 'Processing', items: 5 },
        { id: 'ORD-2024-002', customerName: 'Elena Vane', date: '2024-03-29', total: 159.00, status: 'Pending', items: 1 },
        { id: 'ORD-2024-003', customerName: 'Marcus Chen', date: '2024-03-27', total: 899.00, status: 'Shipped', items: 3 },
        { id: 'ORD-2024-004', customerName: 'Sara Novak', date: '2024-03-25', total: 429.00, status: 'Delivered', items: 2 },
        { id: 'ORD-2024-005', customerName: 'Jordan Reeve', date: '2024-03-26', total: 219.00, status: 'Confirmed', items: 1 },
      ],

      reorderSections: (newLayout) => set({ homepageLayout: newLayout }),
      
      toggleSection: (id) => set((state) => ({
        homepageLayout: state.homepageLayout.map(s => 
          s.id === id ? { ...s, enabled: !s.enabled } : s
        )
      })),

      updatePCBuilder: (settings) => set((state) => ({
        pcBuilderSettings: { ...state.pcBuilderSettings, ...settings }
      })),

      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: `p${state.products.length + 1}` }]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
    }),
    {
      name: 'accessomart-admin-storage',
    }
  )
);
