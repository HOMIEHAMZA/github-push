'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';

interface ProductCardProps {
  id: string;
  variantId?: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  price: string | number;
  imageUrl: string;
  rating?: number;
  isFeatured?: boolean;
}

export function ProductCard({ id, variantId, slug, name, brand, category, price, imageUrl, rating, isFeatured = false }: ProductCardProps) {
  const { addItem, openDrawer } = useCartStore();
  const { toggleWishlist, isInWishlist: checkWishlist } = useWishlistStore();
  const { addToast } = useToastStore();

  const isWishlisted = checkWishlist(id);
  const displayPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price;

  return (
    <div className={`
      relative block w-full overflow-hidden rounded-xl 
      bg-surface-container-low transition-all duration-300
      hover:scale-[1.02] group
      ${isFeatured ? 'shadow-[inset_0_0_1px_#8ff5ff,0_0_8px_rgba(143,245,255,0.2)]' : ''}
    `}>
      {/* Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
            addToast(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist', 'info');
          }}
          className={`
            p-2 rounded-lg backdrop-blur-md border transition-all
            ${isWishlisted 
              ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/20'}
          `}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await addItem(variantId || id);
              addToast(`Added ${name} to loadout`);
            } catch (err: any) {
              addToast(err?.message || 'Failed to add to cart', 'error');
            }
          }}
          className="p-2 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/40 text-primary hover:bg-primary/30 hover:shadow-[0_0_15px_rgba(143,245,255,0.3)] transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      <Link href={`/products/${slug || id}`} className="block">
        {/* Aspect ratio container for the image */}
        <div className="relative w-full aspect-[4/5] bg-surface-container-lowest">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
          
          {/* Gradient Mask overlaid on the image to fade into the card color at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />
          
          {/* Content overlapping the image at the bottom */}
          <div className="absolute bottom-0 left-0 w-full p-6 text-left">
            <div className="flex justify-between items-end mb-2">
              <p className="text-tertiary uppercase text-[10px] font-bold tracking-[0.2em]">{brand}</p>
              {rating && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-primary font-bold">{rating}</span>
                  <span className="text-[10px] text-primary">★</span>
                </div>
              )}
            </div>
            <p className="text-on-surface-variant uppercase text-[10px] font-semibold tracking-wider mb-1 opacity-60">{category}</p>
            <h3 className="text-on-surface font-display text-lg mb-1 truncate leading-tight">{name}</h3>
            <p className="text-on-surface font-bold text-base">{displayPrice}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
