import { create } from 'zustand';
import { wishlistApi } from '@/lib/api-client';
import { ApiWishlistItem } from '@/lib/api-types';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';

interface WishlistState {
  items: ApiWishlistItem[];
  isLoading: boolean;
  error: string | null;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    
    set({ isLoading: true });
    try {
      const { wishlist } = await wishlistApi.get();
      set({ items: wishlist, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const { isAuthenticated } = useAuthStore.getState();
    const { addToast } = useToastStore.getState();
    
    if (!isAuthenticated) {
      addToast('Please log in to save to your wishlist', 'info');
      return;
    }

    const { items } = get();
    const exists = items.find(i => i.productId === productId);

    set({ isLoading: true });
    try {
      if (exists) {
        await wishlistApi.remove(productId);
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          isLoading: false
        }));
        addToast('Removed from wishlist', 'info');
      } else {
        const { item } = await wishlistApi.add(productId);
        set((state) => ({
          items: [...state.items, item],
          isLoading: false
        }));
        addToast('Added to wishlist', 'success');
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      addToast(err.message, 'error');
    }
  },

  isInWishlist: (productId: string) => {
    return !!get().items.find(i => i.productId === productId);
  },
}));
