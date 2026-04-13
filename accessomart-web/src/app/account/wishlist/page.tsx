'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowRight,
  Package,
  Star,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/utils/pricing';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const { items, isLoading, fetchWishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (productId: string, variantId: string) => {
    try {
      await addItem(variantId, 1);
      await toggleWishlist(productId);
      addToast('Removed from Wishlist and added to Loadout', 'success');
    } catch (error) {
      addToast('Failed to sync item to loadout', 'error');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-on-surface tracking-tight uppercase">
          Saved Items
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-12 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(143,245,255,0.4)]" />
          <p className="text-sm font-mono text-on-surface-variant uppercase tracking-[0.2em]">
            Status: <span className="text-primary italic">System Synchronized</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-surface-container border border-surface-container-highest/10 rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const product = item.product;
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            const defaultVariant = product.variants?.[0];
            const rating = product.averageRating || 0;
            const reviewCount = product.reviewCount || 0;

            return (
              <div key={item.id} className="group relative bg-surface-container-low border border-surface-container-highest/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl">
                <div className="flex p-5 gap-6">
                  {/* Image Container */}
                  <div className="relative w-32 h-32 rounded-xl bg-black/40 border border-white/5 shrink-0 overflow-hidden group-hover:border-primary/20 transition-all">
                    {primaryImage ? (
                      <Image 
                        src={primaryImage.url} 
                        alt={product.name} 
                        fill
                        className="object-contain p-3 group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <Package className="w-10 h-10 text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Info Container */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between">
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 bg-primary/5 px-2 py-0.5 rounded leading-tight mb-2 inline-block border border-primary/10">
                           {product.brand?.name || 'Electronics'}
                         </p>
                         <button 
                           onClick={() => toggleWishlist(product.id)}
                           className="p-1.5 text-on-surface-variant/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                           title="Remove item"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <Link 
                        href={`/products/${product.slug}`}
                        className="text-base font-display font-medium truncate block hover:text-primary transition-colors tracking-tight text-on-surface"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-2.5 h-2.5",
                                i < Math.floor(rating) ? "text-primary fill-primary" : "text-on-surface-variant/20"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                          {reviewCount > 0 ? `${rating.toFixed(1)}` : "NEW"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="text-xl font-display font-bold text-on-surface">
                        {formatCurrency(Number(product.basePrice))}
                      </div>
                      <button 
                        onClick={() => defaultVariant && handleMoveToCart(product.id, defaultVariant.id)}
                        disabled={!defaultVariant}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(143,245,255,0.2)] transition-all disabled:opacity-30 uppercase tracking-widest"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 bg-surface-container-low border border-dashed border-surface-container-highest/20 rounded-3xl flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-8 relative">
            <Heart className="w-10 h-10 text-on-surface-variant/20" />
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />
            <Zap className="absolute -top-1 -right-1 text-primary w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold text-on-surface tracking-tight uppercase">Saved List is Empty</h2>
          <p className="text-sm text-on-surface-variant mt-3 max-w-sm mx-auto leading-relaxed">
            Your high-performance wishlist is currently unpopulated. Capture elite gear to begin synchronization.
          </p>
          <Link 
            href="/products" 
            className="mt-10 flex items-center space-x-3 px-8 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.4)] transition-all uppercase tracking-[0.2em] text-sm"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
