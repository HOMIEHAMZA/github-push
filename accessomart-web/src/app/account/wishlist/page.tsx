'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Search, 
  ArrowRight,
  Package,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const { items, isLoading, fetchWishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = async (variantId: string) => {
    try {
      await addItem(variantId, 1);
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#7000ff]">
          My Wishlist
        </h1>
        <p className="mt-2 text-white/40">
          Your curated selection of premium tech and peripherals.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-[#111] border border-white/5 rounded-2xl"></div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const product = item.product;
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            const defaultVariant = product.variants[0];

            return (
              <div key={item.id} className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#00f2ff]/30 transition-all duration-500">
                <div className="flex p-4 gap-4">
                  {/* Image Container */}
                  <div className="relative w-32 h-32 rounded-xl bg-[#0a0a0a] border border-white/5 flex-shrink-0 overflow-hidden group-hover:border-[#00f2ff]/20 transition-colors">
                    {primaryImage ? (
                      <img 
                        src={primaryImage.url} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <Package className="w-8 h-8 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Info Container */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded leading-tight mb-2 inline-block">
                           {product.brand?.name || 'Electronic'}
                         </p>
                         <button 
                           onClick={() => toggleWishlist(product.id)}
                           className="text-white/20 hover:text-red-400 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <Link 
                        href={`/products/${product.slug}`}
                        className="text-sm font-bold truncate block hover:text-[#00f2ff] transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-[#ffb800] fill-[#ffb800]" />
                        <span className="text-[10px] text-white/40">4.9 (120 reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="text-lg font-bold text-white">
                        ${Number(product.basePrice).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => handleAddToCart(defaultVariant?.id)}
                        disabled={!defaultVariant}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-[#00f2ff] transition-all disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add To Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 bg-[#111] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
            <Heart className="w-10 h-10 text-white/10" />
            <div className="absolute inset-0 bg-[#00f2ff]/5 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <h2 className="text-xl font-bold">Your wishlist is empty</h2>
          <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto">
            Save items you love here to keep track of them and get notified about price drops.
          </p>
          <Link 
            href="/products" 
            className="mt-8 flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
