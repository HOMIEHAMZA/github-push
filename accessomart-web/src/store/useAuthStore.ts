import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api-client';
import { ApiUser } from '@/lib/api-types';

interface AuthOptions {
  silent?: boolean;
}

interface AuthState {
  user: ApiUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGuest: () => boolean;

  login: (email: string, password: string, options?: AuthOptions) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }, options?: AuthOptions) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: (options?: AuthOptions) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isGuest: () => {
        const user = get().user;
        return !!user && (user.email.startsWith('guest_') || user.firstName === 'Guest');
      },

      login: async (email, password, options) => {
        if (!options?.silent) set({ isLoading: true, error: null });
        try {
          const { user } = await authApi.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          if (!options?.silent) set({ 
            error: err instanceof Error ? err.message : 'Login failed.', 
            isLoading: false 
          });
          throw err;
        }
      },

      register: async (data, options) => {
        if (!options?.silent) set({ isLoading: true, error: null });
        try {
          const { user } = await authApi.register(data);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          if (!options?.silent) set({ 
            error: err instanceof Error ? err.message : 'Registration failed.', 
            isLoading: false 
          });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Always clear local state even if API fails
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      fetchMe: async (options) => {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
        if (!token) return;

        if (!options?.silent) set({ isLoading: true, error: null });
        try {
          const { user } = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // Token expired or API offline/rate-limited
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: err instanceof Error ? err.message : 'Session restoration failed'
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'accessomart-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
