'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import Link from 'next/link';

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

type Tab = 'all' | 'new' | 'best';

export function FeaturedProducts({ title, subtitle, products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeTab === 'all') return products.slice(0, 8);
    if (activeTab === 'new') return products.slice().reverse().slice(0, 4); // Mocking "new" as recent
    if (activeTab === 'best') return products.filter(p => p.isFeatured).slice(0, 4);
    return products;
  }, [products, activeTab]);

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
            <button 
              onClick={() => setActiveTab('all')}
              className={`font-semibold text-sm transition-all pb-2 border-b-2 ${
                activeTab === 'all' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              All Products
            </button>
            <button 
              onClick={() => setActiveTab('new')}
              className={`font-semibold text-sm transition-all pb-2 border-b-2 ${
                activeTab === 'new' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              New Arrivals
            </button>
            <button 
              onClick={() => setActiveTab('best')}
              className={`font-semibold text-sm transition-all pb-2 border-b-2 ${
                activeTab === 'best' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              {...product}
            />
          ))}
        </div>
        
        <div className="mt-20 flex justify-center">
          <Link 
            href="/products"
            className="px-12 py-4 rounded-xl border border-outline-variant/30 text-on-surface font-display uppercase tracking-widest text-sm hover:bg-surface-container transition-all hover:border-primary/50"
          >
            Show More Gear
          </Link>
        </div>
      </div>
    </section>
  );
}
