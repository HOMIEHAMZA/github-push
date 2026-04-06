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

  // Calculate which options are available given current selections in OTHER dimensions
  const getAvailableOptions = (dimension: 'color' | 'size' | 'model') => {
    return variants.filter(v => {
      // For the dimension we are checking, we don't filter by its own current selection
      const colorMatch = dimension === 'color' || !activeDimensions.color || !selections.color || v.color === selections.color;
      const sizeMatch = dimension === 'size' || !activeDimensions.size || !selections.size || v.size === selections.size;
      const modelMatch = dimension === 'model' || !activeDimensions.model || !selections.model || v.model === selections.model;
      return colorMatch && sizeMatch && modelMatch;
    }).map(v => v[dimension]).filter(Boolean) as string[];
  };

  const availableOptions = {
    colors: getAvailableOptions('color'),
    sizes: getAvailableOptions('size'),
    models: getAvailableOptions('model')
  };

  const handleAttributeSelect = (dimension: 'color' | 'size' | 'model', value: string) => {
    const newSelections = { ...selections, [dimension]: value };
    
    // Find if this new combination is valid
    const match = variants.find(v => 
      (!activeDimensions.color || v.color === newSelections.color) &&
      (!activeDimensions.size || v.size === newSelections.size) &&
      (!activeDimensions.model || v.model === newSelections.model)
    );

    if (match) {
      setSelections(newSelections);
      setSelectedVariant(match);
    } else {
      // If the combination is invalid, we reset other selections to find a valid one with the new attribute
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
          {activeDimensions.color && allOptions.colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Colorway</label>
              <div className="flex flex-wrap gap-2">
                {allOptions.colors.map(color => {
                  const isSelected = selections.color === color;
                  const isAvailable = availableOptions.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!isAvailable && !isSelected}
                      onClick={() => handleAttributeSelect('color', color)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isAvailable
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-dashed border-white/5 text-white/10 cursor-not-allowed"
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
                  const isAvailable = availableOptions.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable && !isSelected}
                      onClick={() => handleAttributeSelect('size', size)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isAvailable
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-dashed border-white/5 text-white/10 cursor-not-allowed"
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
                  const isAvailable = availableOptions.models.includes(model);
                  return (
                    <button
                      key={model}
                      type="button"
                      disabled={!isAvailable && !isSelected}
                      onClick={() => handleAttributeSelect('model', model)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : isAvailable
                            ? "bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-white/20"
                            : "bg-surface-container/30 border-dashed border-white/5 text-white/10 cursor-not-allowed"
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
