'use client';

import { useEffect, useState, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * GuestAuthProvider
 * Automatically registers and logs in a hidden guest user if no session exists.
 * This satisfies the backend API's requirement for a valid JWT without forcing
 * the user through a login screen prematurely.
 */
export function GuestAuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const initializeCart = useCartStore((state) => state.initializeCart);
  
  // To avoid infinite loops in strict mode
  const initialized = useRef(false);

  useEffect(() => {
    async function setupGuestSession() {
      if (initialized.current) return;
      initialized.current = true;
      
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        if (token) {
          // Already have a session, fetch the cart normally
          // Also fetchme to populate auth store
          await useAuthStore.getState().fetchMe();
          await initializeCart();
          setIsInitializing(false);
          return;
        }

        // Register a random guest user
        const guestId = Math.random().toString(36).substring(7);
        const guestEmail = `guest_${guestId}@accessomart.com`;
        const guestPassword = `TempPassword!${guestId}`;

        // Attempt registration via auth store
        await useAuthStore.getState().register({
          firstName: 'Guest',
          lastName: 'User',
          email: guestEmail,
          password: guestPassword,
        });

        // Fetch cart via Zustand store after auth setup
        await initializeCart();
      } catch (error) {
        console.error('[GuestAuth] Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    setupGuestSession();
  }, [initializeCart]);

  // Optionally block rendering the app until the guest token is obtained,
  // but to preserve speed, we yield children immediately and components
  // that rely on cart will show empty until initialization completes.
  return <>{children}</>;
}
