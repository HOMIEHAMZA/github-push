'use client';

import React, { useState } from 'react';
import { Heart, ShoppingCart, ShieldCheck, Zap, Truck } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';

interface ProductPurchaseBlockProps {
  productId: string;
  variantId: string;
  price: number;
  originalPrice?: number;
  stockStatus: 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';
  brand: string;
}

export function ProductPurchaseBlock({ productId, variantId, price, originalPrice, stockStatus, brand }: ProductPurchaseBlockProps) {
  const { addItem, openDrawer } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  
  const isWishlisted = isInWishlist(productId);
  const [quantity, setQuantity] = useState(1);

  const stockInfo = {
    IN_STOCK: { label: 'Operational (In Stock)', color: 'text-primary' },
    LIMITED_STOCK: { label: 'Low Energy (Limited Stock)', color: 'text-yellow-400' },
    OUT_OF_STOCK: { label: 'Offline (Out of Stock)', color: 'text-red-500' }
  };

  return (
    <div className="flex flex-col gap-8 p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl">
      {/* Brand & Stock */}
      <div className="flex justify-between items-center">
        <Badge variant="primary" className="text-[10px] tracking-[0.2em] font-bold uppercase py-1 px-4 border-primary/40 text-primary">
          {brand} DIRECT
        </Badge>
        <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${stockInfo[stockStatus].color}`}>
          <div className={`w-2 h-2 rounded-full bg-current ${stockStatus !== 'OUT_OF_STOCK' ? 'animate-pulse' : ''}`} />
          {stockInfo[stockStatus].label}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl lg:text-5xl font-display text-on-surface tracking-tight">
          ${price.toLocaleString()}
        </span>
        {originalPrice && (
          <span className="text-xl text-on-surface-variant line-through opacity-50">
            ${originalPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container rounded-lg border border-surface-container-highest/20 overflow-hidden">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors"
            > - </button>
            <span className="px-6 py-2 text-on-surface font-mono w-16 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors"
            > + </button>
          </div>
          
          <button 
            onClick={() => {
              toggleWishlist(productId);
              addToast(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist', 'info');
            }}
            className={`
              p-3 rounded-lg border transition-all duration-300
              ${isWishlisted 
                ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-primary/40'}
            `}
          >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <PrimaryButton 
          className="w-full bg-primary py-6 text-base tracking-[0.25em] h-auto shadow-[0_0_30px_rgba(143,245,255,0.15)]"
          disabled={stockStatus === 'OUT_OF_STOCK'}
          onClick={async () => {
            try {
              await addItem(variantId, quantity); // Use variantId for API interaction
              addToast('Added to your loadout');
              openDrawer();
            } catch (err: any) {
              addToast(err?.message || 'Failed to add to cart', 'error');
            }
          }}

        >
          <ShoppingCart size={20} className="mr-3" />
          CALIBRATE & ADD TO CART
        </PrimaryButton>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-container-highest/10">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant font-sans tracking-wide">
          <Truck size={16} className="text-primary" />
          Rapid Obsidian Delivery
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant font-sans tracking-wide">
          <ShieldCheck size={16} className="text-primary" />
          24-Cycle Protection
        </div>
      </div>
    </div>
  );
}
