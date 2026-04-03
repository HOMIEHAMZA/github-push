'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * GuestAuthProvider
 * Automatically registers and logs in a hidden guest user if no session exists.
 * This satisfies the backend API's requirement for a valid JWT without forcing
 * the user through a login screen prematurely.
 */
export function GuestAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initializeCart = useCartStore((state) => state.initializeCart);
  
  // To avoid infinite loops in strict mode
  const initialized = useRef(false);

  useEffect(() => {
    // ─── AUTH PAGE PROTECTION ──────────────────────────────────────────────────
    // Do NOT attempt guest auto-registration if the user is explicitly
    // on a real login or register page. This avoids rate-limiting conflicts 
    // and store "loading" states from interfering with the real user credentials.
    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin');
    
    async function setupGuestSession() {
      if (initialized.current || isAuthPage) {
        return;
      }
      initialized.current = true;
      
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        if (token) {
          // Already have a session, fetch profile and cart normally
          // Using silent: true to prevent global loading indicators for background restoration
          await useAuthStore.getState().fetchMe({ silent: true });
          await initializeCart();
          return;
        }

        // Register a random guest user
        const guestId = Math.random().toString(36).substring(7);
        const guestEmail = `guest_${guestId}@accessomart.com`;
        const guestPassword = `TempPassword!${guestId}`;

        // Attempt background registration
        await useAuthStore.getState().register({
          firstName: 'Guest',
          lastName: 'User',
          email: guestEmail,
          password: guestPassword,
        }, { silent: true });

        // Fetch cart via Zustand store after auth setup
        await initializeCart();
      } catch (error) {
        console.error('[GuestAuth] Initialization error:', error);
      }
    }

    setupGuestSession();
  }, [initializeCart, pathname]);

  // Optionally block rendering the app until the guest token is obtained,
  // but to preserve speed, we yield children immediately and components
  // that rely on cart will show empty until initialization completes.
  return <>{children}</>;
}
