import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';

interface Product {
  id: string;
  variantId?: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  imageUrl: string;
  isFeatured?: boolean;
}

interface FeaturedProductsProps {
  title: string;
  subtitle: string;
  products: Product[];
}

export function FeaturedProducts({ title, subtitle, products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h3 className="text-tertiary font-display text-sm uppercase tracking-[0.2em] mb-4">
              {subtitle}
            </h3>
            <h2 className="text-4xl md:text-5xl font-display text-on-surface">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <button className="text-on-surface font-semibold text-sm hover:text-primary transition-colors pb-2 border-b-2 border-primary">All Products</button>
            <button className="text-on-surface-variant font-semibold text-sm hover:text-on-surface transition-colors pb-2 border-b-2 border-transparent">New Arrivals</button>
            <button className="text-on-surface-variant font-semibold text-sm hover:text-on-surface transition-colors pb-2 border-b-2 border-transparent">Best Sellers</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              {...product}
            />
          ))}
        </div>
        
        <div className="mt-20 flex justify-center">
          <button className="px-12 py-4 rounded-xl border border-outline-variant/30 text-on-surface font-display uppercase tracking-widest text-sm hover:bg-surface-container transition-all hover:border-primary/50">
            Show More Gear
          </button>
        </div>
      </div>
    </section>
  );
}
