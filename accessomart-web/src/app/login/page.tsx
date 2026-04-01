'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { cartApi } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { login, error, clearError, isGuest, isAuthenticated } = useAuthStore();
  const { items, initializeCart } = useCartStore();

  useEffect(() => {
    // If they are authenticated and NOT a guest, redirect away empty
    if (isAuthenticated && !isGuest()) {
      router.push('/');
    }
  }, [isAuthenticated, isGuest, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    // Stash the guest cart items so we can replay them
    const guestItems = [...items];

    try {
      await login(email, password);

      // Replay guest cart items into the newly authenticated user's cart (Best Effort)
      if (guestItems.length > 0) {
        try {
          await initializeCart();
          for (const item of guestItems) {
            try {
              await cartApi.addItem(item.variantId || item.id, item.quantity);
            } catch(e) {
              console.warn("Failed to migrate guest item:", item, e);
            }
          }
          await initializeCart();
        } catch (cartErr) {
          console.error("Cart migration system failure:", cartErr);
        }
      }

      router.push('/');
    } catch (err) {
      console.error("[Login] Submit failed:", err);
      // Ensure we always reset the submitting state
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container-low p-10 rounded-3xl border border-surface-container-highest/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-on-surface mb-2 tracking-tight">Accessomart</h1>
            <p className="text-on-surface-variant text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <PrimaryButton 
              type="submit" 
              className="w-full justify-center py-4"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  SIGN IN <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </PrimaryButton>
          </form>

          <div className="pt-6 border-t border-surface-container-highest/10 text-center">
            <p className="text-sm text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
