import { create } from 'zustand';
import { cartApi } from '@/lib/api-client';
import { useToastStore } from '@/store/useToastStore';

export interface CartItem {
  id: string; // The backend CartItem ID
  variantId: string;
  quantity: number;
  name: string;
  brand: string;
  imageUrl?: string;
  price: number;
  cartId?: string;
  isCustomBuild?: boolean;
  buildComponents?: unknown[];
  buildName?: string;
  color?: string | null;
  size?: string | null;
  model?: string | null;
  inventory?: {
    quantity: number;
    reservedQty: number;
  };
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isLoading: boolean;
  initializeCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isLoading: false,

  initializeCart: async () => {
    try {
      set({ isLoading: true });
      const { items } = await cartApi.get();
      // Map backend ApiCartItem to Zustand CartItem
      const mappedItems: CartItem[] = items.map((apiItem) => ({
        id: apiItem.id,
        variantId: apiItem.variantId,
        quantity: apiItem.quantity,
        cartId: apiItem.cartId,
        name: apiItem.variant.product.name,
        brand: apiItem.variant.product.brand?.name || 'Unknown',
        imageUrl: apiItem.variant.imageUrl || apiItem.variant.product.images?.[0]?.url || undefined,
        price: Number(apiItem.variant.price),
        color: apiItem.variant.color,
        size: apiItem.variant.size,
        model: apiItem.variant.model,
        inventory: apiItem.variant.inventory ? {
          quantity: apiItem.variant.inventory.quantity,
          reservedQty: apiItem.variant.inventory.reservedQty,
        } : undefined,
      }));
      set({ items: mappedItems, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    try {
      set({ isLoading: true });
      await cartApi.addItem(variantId, quantity);
      await get().initializeCart(); // Refresh cart to get the new total from server
      set({ isDrawerOpen: true });
      useToastStore.getState().addToast('Added to loadout', 'success');
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      const message = err.response?.status === 409 
        ? 'Insufficient stock for this upgrade' 
        : 'Failed to sync with command center';
      useToastStore.getState().addToast(message, 'error');
      console.error('Failed to add item to cart:', error);
      throw error; 
    } finally {
      set({ isLoading: false });
    }
  },


  removeItem: async (id) => {
    try {
      set({ isLoading: true });
      // Optimistic upate
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      await cartApi.removeItem(id);
    } catch (error) {
      useToastStore.getState().addToast('Failed to remove item', 'error');
      console.error('Failed to remove item:', error);
      await get().initializeCart(); // Revert on failure
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      if (quantity < 1) return;
      set({ isLoading: true });
      // Optimistic update
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      }));
      await cartApi.updateItem(id, quantity);
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      const message = err.response?.status === 409 
        ? 'Maximum available stock reached' 
        : 'Failed to update quantity';
      useToastStore.getState().addToast(message, 'error');
      console.error('Failed to update quantity:', error);
      await get().initializeCart(); // Revert
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true });
      await cartApi.clear();
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));
