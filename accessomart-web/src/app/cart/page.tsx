'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, Zap, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/components/cart/CartItem';
import { formatCurrency, PRICING_CONFIG } from '@/utils/pricing';

export default function CartPage() {
  const { items, isLoading, initializeCart } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    initializeCart();
  }, [initializeCart]);

  const subtotal = items.reduce((total, item) => {
    return total + ((item.price || 0) * item.quantity);
  }, 0);

  const shipping = subtotal > PRICING_CONFIG.shippingThreshhold ? 0 : PRICING_CONFIG.shippingCost;
  const tax = subtotal * PRICING_CONFIG.taxRate;
  const total = subtotal + shipping + tax;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-12 rounded-3xl border border-surface-container-highest/10 space-y-6 max-w-md"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Zap className="text-primary" size={40} />
          </div>
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-display font-bold text-on-surface">Your loadout is empty</h1>
            {isLoading && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Every elite setup starts with a single piece of gear. Browse the catalog to begin your calibration.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold tracking-widest uppercase text-sm hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all"
          >
            BROWSE GEAR
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-primary font-bold tracking-widest uppercase mb-4 hover:opacity-70 transition-opacity">
              <ArrowLeft size={16} />
              Return to Catalog
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-on-surface tracking-tight">SHOPPING CART</h1>
              {isLoading && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            </div>
          </div>
          <p className="text-sm font-mono text-on-surface-variant uppercase tracking-[0.2em]">
            Status: <span className="text-primary">PRE-TRANSACTION</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] pb-4 border-b border-surface-container-highest/10">
              <span>Item Details</span>
              <span className="hidden md:block">Configuration</span>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} variant="page" />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <div className="sticky top-40 p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl space-y-8">
              <h2 className="text-xl font-bold text-on-surface tracking-tight border-b border-surface-container-highest/10 pb-4">
                ORDER SUMMARY
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-sm">Obsidian Delivery</span>
                  <span className="font-mono text-primary">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-sm">Estimated Tax ({PRICING_CONFIG.taxRate * 100}%)</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-4 border-t border-surface-container-highest/10 flex justify-between items-end">
                  <span className="text-lg font-bold text-on-surface">TOTAL</span>
                  <span className="text-2xl font-bold text-primary font-mono">{formatCurrency(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] transition-all active:scale-95"
              >
                PROCEED TO CHECKOUT
                <ArrowRight size={18} />
              </Link>

              {/* Guarantees */}
              <div className="grid grid-cols-1 gap-4 pt-6 border-t border-surface-container-highest/10">
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  <Truck size={14} className="text-primary" />
                  Insured Rapid Shipping
                </div>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-primary" />
                  Secure Transaction Layer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
