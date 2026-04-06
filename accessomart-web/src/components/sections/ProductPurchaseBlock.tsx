'use client';

import React, { useState } from 'react';
import { Heart, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { ApiProductVariant } from '@/lib/api-types';

interface ProductPurchaseBlockProps {
  productId: string;
  variants: ApiProductVariant[];
  brand: string;
}

export function ProductPurchaseBlock({ productId, variants, brand }: ProductPurchaseBlockProps) {
  const { addItem, openDrawer } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  
  const isWishlisted = isInWishlist(productId);
  const [quantity, setQuantity] = useState(1);

  // Initialize with default variant or first available
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariant>(
    variants.find(v => v.isDefault) || variants[0]
  );
  const [isAdding, setIsAdding] = useState(false);

  const stockStatus = selectedVariant?.inventory && selectedVariant.inventory.quantity > 10 
    ? 'IN_STOCK' 
    : selectedVariant?.inventory && selectedVariant.inventory.quantity > 0 
      ? 'LIMITED_STOCK' 
      : 'OUT_OF_STOCK';

  const stockInfo = {
    IN_STOCK: { label: 'Operational (In Stock)', color: 'text-primary' },
    LIMITED_STOCK: { label: 'Low Energy (Limited Stock)', color: 'text-yellow-400' },
    OUT_OF_STOCK: { label: 'Offline (Out of Stock)', color: 'text-red-500' }
  };

  // Group variants by attributes for selection UI
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
  const models = Array.from(new Set(variants.map(v => v.model).filter(Boolean)));

  const handleVariantSelect = (type: 'color' | 'size' | 'model', value: string) => {
    // Try to find a variant that matches the new selection PLUS the other current selections
    const newSelections = {
      color: selectedVariant?.color,
      size: selectedVariant?.size,
      model: selectedVariant?.model,
      [type]: value
    };

    const perfectMatch = variants.find(v => 
      v.color === newSelections.color && 
      v.size === newSelections.size && 
      v.model === newSelections.model
    );

    if (perfectMatch) {
      setSelectedVariant(perfectMatch);
    } else {
      // Fallback: Just find the first one that matches the new clicked attribute
      const fallbackMatch = variants.find(v => v[type] === value);
      if (fallbackMatch) setSelectedVariant(fallbackMatch);
    }
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
          ${Number(selectedVariant?.price || 0).toLocaleString()}
        </span>
        {selectedVariant?.comparePrice && Number(selectedVariant.comparePrice) > 0 && (
          <span className="text-xl text-on-surface-variant line-through opacity-50">
            ${Number(selectedVariant.comparePrice).toLocaleString()}
          </span>
        )}
      </div>

      {/* Selection UI */}
      {variants.length > 1 && (
        <div className="space-y-6 py-4 border-t border-b border-surface-container-highest/10">
          {colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Colorway</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleVariantSelect('color', color!)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                      selectedVariant?.color === color
                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Size / Dimension</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleVariantSelect('size', size!)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                      selectedVariant?.size === size
                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {models.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Model Revision</label>
              <div className="flex flex-wrap gap-2">
                {models.map(model => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleVariantSelect('model', model!)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                      selectedVariant?.model === model
                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                    )}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for variants that use SKU/Name but no Color/Size/Model labels */}
          {colors.length === 0 && sizes.length === 0 && models.length === 0 && (
             <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Options</label>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                      selectedVariant?.id === v.id
                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                        : "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                    )}
                  >
                    {v.name || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container rounded-lg border border-surface-container-highest/20 overflow-hidden">
            <button 
              type="button"
              title="Decrease quantity"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors"
            > - </button>
            <span className="px-6 py-2 text-on-surface font-mono w-16 text-center">{quantity}</span>
            <button 
              type="button"
              title="Increase quantity"
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors"
            > + </button>
          </div>
          
          <button 
            type="button"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
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
          disabled={stockStatus === 'OUT_OF_STOCK' || isAdding}
          title="Add to cart"
          onClick={async () => {
            setIsAdding(true);
            try {
              if (!selectedVariant) throw new Error('Selection required');
              await addItem(selectedVariant.id, quantity);
              addToast('Added to your loadout');
              openDrawer();
            } catch (err: unknown) {
              console.error('Failed to add item to cart:', err);
            } finally {
              setIsAdding(false);
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
