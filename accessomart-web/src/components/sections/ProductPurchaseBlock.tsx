'use client';

import React, { useState } from 'react';
import { Heart, ShoppingCart, ShieldCheck, Truck, Lock, CreditCard, Headset, Star } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/pricing';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { ApiProductVariant } from '@/lib/api-types';

interface ProductPurchaseBlockProps {
  productId: string;
  variants: ApiProductVariant[];
  brand: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductPurchaseBlock({ 
  productId, 
  variants, 
  brand,
  rating = 0,
  reviewCount = 0
}: ProductPurchaseBlockProps) {
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

  const availableStock = selectedVariant?.inventory ? (selectedVariant.inventory.quantity - selectedVariant.inventory.reservedQty) : 0;

  React.useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock === 0 && quantity > 1) {
      setQuantity(1); // Button disabled, keep UI clean
    }
  }, [availableStock, quantity]);

  const stockStatus = selectedVariant?.inventory && availableStock > 10 
    ? 'IN_STOCK' 
    : selectedVariant?.inventory && availableStock > 0 
      ? 'LIMITED_STOCK' 
      : 'OUT_OF_STOCK';

  const stockInfo = {
    IN_STOCK: { label: 'Operational (In Stock)', color: 'text-primary' },
    LIMITED_STOCK: { label: 'Low Energy (Limited Stock)', color: 'text-yellow-400' },
    OUT_OF_STOCK: { label: 'Offline (Out of Stock)', color: 'text-red-500' }
  };

  // Identify which attribute dimensions are active for this product
  const activeDimensions = {
    color: variants.some(v => v.color),
    size: variants.some(v => v.size),
    model: variants.some(v => v.model)
  };

  // Get all unique possible values for each dimension
  const allOptions = {
    colors: Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[],
    sizes: Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[],
    models: Array.from(new Set(variants.map(v => v.model).filter(Boolean))) as string[]
  };

  // Selection state for each dimension
  const [selections, setSelections] = useState({
    color: selectedVariant?.color || null,
    size: selectedVariant?.size || null,
    model: selectedVariant?.model || null
  });

  // Calculate which options are compatible with current selections in OTHER dimensions
  const getCompatibleOptions = (dimension: 'color' | 'size' | 'model') => {
    return variants.filter(v => {
      // For the dimension we are checking, we don't filter by its own current selection
      const colorMatch = dimension === 'color' || !activeDimensions.color || !selections.color || v.color === selections.color;
      const sizeMatch = dimension === 'size' || !activeDimensions.size || !selections.size || v.size === selections.size;
      const modelMatch = dimension === 'model' || !activeDimensions.model || !selections.model || v.model === selections.model;
      return colorMatch && sizeMatch && modelMatch;
    }).map(v => v[dimension]).filter(Boolean) as string[];
  };

  const compatibleOptions = {
    colors: getCompatibleOptions('color'),
    sizes: getCompatibleOptions('size'),
    models: getCompatibleOptions('model')
  };

  const handleAttributeSelect = (dimension: 'color' | 'size' | 'model', value: string) => {
    const newSelections = { ...selections, [dimension]: value };
    
    // 1. Try to find a variant that matches the new selection PLUS the other current selections
    const perfectMatch = variants.find(v => 
      (!activeDimensions.color || v.color === newSelections.color) &&
      (!activeDimensions.size || v.size === newSelections.size) &&
      (!activeDimensions.model || v.model === newSelections.model)
    );

    if (perfectMatch) {
      setSelections(newSelections);
      setSelectedVariant(perfectMatch);
    } else {
      // 2. If the exact combination is invalid, find ANY variant that has this attribute
      // and reset other selections to match it (re-calibration)
      const fallbackMatch = variants.find(v => v[dimension] === value);
      if (fallbackMatch) {
        const resetSelections = {
          color: activeDimensions.color ? (fallbackMatch.color ?? null) : null,
          size: activeDimensions.size ? (fallbackMatch.size ?? null) : null,
          model: activeDimensions.model ? (fallbackMatch.model ?? null) : null
        };
        setSelections(resetSelections);
        setSelectedVariant(fallbackMatch);
      }
    }
  };

  const selectedCombinationLabel = [
    selections.color,
    selections.size,
    selections.model
  ].filter(Boolean).join(' / ');

  return (
    <div className="flex flex-col gap-8 p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl">
      {/* Brand & Stock */}
      <div className="flex justify-between items-center">
        <Badge variant="primary" className="text-[10px] tracking-[0.2em] font-bold uppercase py-1 px-4 border-primary/40 text-primary">
          {brand} DIRECT
        </Badge>
        <div className={`flex flex-col items-end gap-1 ${stockInfo[stockStatus].color}`}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full bg-current ${stockStatus !== 'OUT_OF_STOCK' ? 'animate-pulse' : ''}`} />
            {stockInfo[stockStatus].label}
          </div>
          <div className="text-[10px] font-medium text-on-surface-variant/70 mt-1">
            Delivery estimate: 3–5 business days
          </div>
          {stockStatus === 'LIMITED_STOCK' && availableStock > 0 && (
            <span className="text-[10px] font-bold opacity-80 animate-pulse">
              Only {availableStock} units remaining
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl lg:text-5xl font-display text-on-surface tracking-tight">
          {formatCurrency(Number(selectedVariant?.price || 0))}
        </span>
        {selectedVariant?.comparePrice && Number(selectedVariant.comparePrice) > 0 && (
          <span className="text-xl text-on-surface-variant line-through opacity-50">
            {formatCurrency(Number(selectedVariant.comparePrice))}
          </span>
        )}
      </div>
      
      {/* Rating Trust Block */}
      <div className="flex items-center gap-4 bg-surface-container/30 px-4 py-3 rounded-xl border border-primary/10">
        <div className="flex gap-0.5 text-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < Math.floor(rating) ? "currentColor" : "none"} 
              className={i < Math.floor(rating) ? "" : "opacity-30"}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-display font-medium text-on-surface tracking-tight">
            {rating > 0 ? `${rating.toFixed(1)} System Rating` : "No Ratings Yet"}
          </span>
          <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider opacity-60">
            {reviewCount > 0 ? `Based on ${reviewCount} review${reviewCount === 1 ? '' : 's'}` : "Be the first to calibrate"}
          </span>
        </div>
      </div>

      {/* Selection UI */}
      {variants.length > 1 && (
        <div className="space-y-6 py-4 border-t border-b border-surface-container-highest/10">
          {activeDimensions.color && allOptions.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Colorway</label>
              <div className="flex flex-wrap gap-2">
                {allOptions.colors.map(color => {
                  const isSelected = selections.color === color;
                  const isCompatible = compatibleOptions.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleAttributeSelect('color', color)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isCompatible
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-white/5 text-on-surface-variant/40 hover:border-white/10"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeDimensions.size && allOptions.sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Size / Dimension</label>
              <div className="flex flex-wrap gap-2">
                {allOptions.sizes.map(size => {
                  const isSelected = selections.size === size;
                  const isCompatible = compatibleOptions.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleAttributeSelect('size', size)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isCompatible
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-white/5 text-on-surface-variant/40 hover:border-white/10"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeDimensions.model && allOptions.models.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Model Revision</label>
              <div className="flex flex-wrap gap-2">
                {allOptions.models.map(model => {
                  const isSelected = selections.model === model;
                  const isCompatible = compatibleOptions.models.includes(model);
                  return (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleAttributeSelect('model', model)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isCompatible
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-white/5 text-on-surface-variant/40 hover:border-white/10"
                      )}
                    >
                      {model}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback for variants that use SKU/Name but no Color/Size/Model labels */}
          {!activeDimensions.color && !activeDimensions.size && !activeDimensions.model && (
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

          {/* Display current combination for clarity */}
          {selectedCombinationLabel && (
            <div className="pt-2">
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-mono">
                Current Configuration: <span className="text-primary">{selectedCombinationLabel}</span>
              </p>
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
              disabled={quantity >= availableStock}
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              className="px-4 py-2 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          disabled={stockStatus === 'OUT_OF_STOCK' || isAdding || quantity > availableStock}
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

      {/* Trust & Features List */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-6 border-t border-surface-container-highest/10">
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          <Lock size={14} className="text-primary" />
          Secure Checkout
        </div>
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          <CreditCard size={14} className="text-primary" />
          Stripe & PayPal Protected
        </div>
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          <Truck size={14} className="text-primary" />
          Fast Logistics
        </div>
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          <Headset size={14} className="text-primary" />
          Support & Warranty
        </div>
      </div>
    </div>
  );
}
