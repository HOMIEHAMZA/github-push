'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from './CartItem';
import { formatCurrency } from '@/utils/pricing';

export const CartDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, items, isLoading, initializeCart } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      initializeCart();
    }
  }, [isDrawerOpen, initializeCart]);

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    return total + ((item.price || 0) * item.quantity);
  }, 0);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-zinc-950 border-l border-white/5 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-cyan-400" size={20} />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Your Loadout</h3>
                  {isLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">
                  {items.length} MODELS
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {items.length > 0 ? (
                items.map((item) => (
                  <CartItem key={item.id} item={item} variant="drawer" />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                    <ShoppingBag size={32} strokeWidth={1} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Your cart is empty</p>
                    <p className="text-sm text-white/40">Start building your setup</p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="px-6 py-2 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Browse Gear
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-white/40">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl font-mono text-cyan-400">{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95"
                  >
                    PROCEED TO CHECKOUT
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center py-3 text-sm font-medium text-white/40 hover:text-white transition-colors"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
