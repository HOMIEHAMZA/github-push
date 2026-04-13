'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2, Bookmark } from 'lucide-react';
import { useCartStore, type CartItem as ICartItem } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency } from '@/utils/pricing';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CartItemProps {
  item: ICartItem;
  variant?: 'drawer' | 'page';
}

export const CartItem: React.FC<CartItemProps> = ({ item, variant = 'drawer' }) => {
  const { 
    id, 
    quantity, 
    isCustomBuild, 
    buildComponents, 
    buildName, 
    price, 
    name, 
    brand, 
    imageUrl 
  } = item;
  const { updateQuantity, removeItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  
  const isWishlisted = isInWishlist(item.productId);

  const displayName = isCustomBuild ? buildName : name;
  const displayBrand = isCustomBuild ? "Custom Build" : brand;
  const displayPrice = price || 0;
  const displayImage = isCustomBuild ? "/images/components/case.png" : imageUrl;

  const isDrawer = variant === 'drawer';
  const availableStock = item.inventory ? (item.inventory.quantity - item.inventory.reservedQty) : 0;

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10",
      !isDrawer && "md:p-6"
    )}>
      {/* Product Image */}
      <div className={cn(
        "relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0",
        isDrawer ? "w-20" : "w-24 md:w-32"
      )}>
        {displayImage && (
          <Image
            src={displayImage}
            alt={displayName || "Item"}
            fill
            className="object-contain p-2"
          />
        )}
      </div>

      {/* Info & Actions */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className={cn(
              "font-semibold text-white truncate",
              isDrawer ? "text-sm" : "text-base md:text-lg"
            )}>
              {displayName}
            </h4>
            <p className="text-xs text-white/40 uppercase tracking-widest">{displayBrand}</p>
            {item.color || item.size || item.model ? (
              <div className="flex gap-1.5 mt-1">
                {[
                  item.color,
                  item.size,
                  item.model
                ].filter(Boolean).map((attr, idx, arr) => (
                  <span key={idx} className="text-[10px] text-cyan-400/80 font-mono flex items-center">
                    {attr}
                    {idx < arr.length - 1 && <span className="mx-1 text-white/10">/</span>}
                  </span>
                ))}
              </div>
            ) : isCustomBuild && buildComponents && (
              <p className="text-[10px] text-cyan-400/60 mt-1 line-clamp-1 italic">
                {(buildComponents as unknown[]).length} Performance Modules
              </p>
            )}
          </div>
          <p className={cn(
            "font-bold text-cyan-400 font-mono",
            isDrawer ? "text-sm" : "text-lg"
          )}>
            {formatCurrency(displayPrice * quantity)}
          </p>
        </div>
 
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => updateQuantity(id, quantity - 1)}
              title="Decrease quantity"
              className="p-1 rounded-md hover:bg-white/5 text-white/60 hover:text-white transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={isDrawer ? 14 : 16} />
            </button>
            <span className={cn(
              "font-mono text-white text-center min-w-[24px]",
              isDrawer ? "text-xs" : "text-sm"
            )}>
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(id, Math.min(availableStock, quantity + 1))}
              title="Increase quantity"
              className="p-1 rounded-md hover:bg-white/5 text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={quantity >= availableStock}
            >
              <Plus size={isDrawer ? 14 : 16} />
            </button>
          </div>
 
          <div className="flex items-center gap-1">
            <button
              onClick={async () => {
                 if (!isWishlisted) {
                    await toggleWishlist(item.productId);
                 }
                 await removeItem(id);
                 addToast('Removed from Cart and saved to Wishlist', 'success');
              }}
              title="Save for Later"
              className={cn(
                "p-2 transition-colors",
                isWishlisted ? "text-primary" : "text-white/30 hover:text-primary"
              )}
            >
              <Bookmark size={isDrawer ? 16 : 18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => removeItem(id)}
              title="Remove item"
              className="p-2 text-white/30 hover:text-red-400 transition-colors"
            >
              <Trash2 size={isDrawer ? 16 : 18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
