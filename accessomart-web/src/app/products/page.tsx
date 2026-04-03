'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api-client';
import { ApiProduct, ApiCategory } from '@/lib/api-types';
import { ProductCard } from '@/components/ui/ProductCard';
import { Loader2, AlertCircle, SlidersHorizontal, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.list({ category: categoryParam || undefined, limit: 100 }),
          categoriesApi.list()
        ]);
        
        if (isSubscribed) {
          setProducts(productsRes.products);
          setCategories(categoriesRes.categories);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) setError(err instanceof Error ? err.message : 'Failed to synchronize catalog.');
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isSubscribed = false; };
  }, [categoryParam]);

  const activeCategory = categories.find(c => 
    c.slug === categoryParam || c.name.toLowerCase().replace(/ /g, '-') === categoryParam
  );

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-on-surface-variant font-sans text-xs uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-on-surface">Gear Catalog</span>
            {activeCategory && (
              <>
                <ChevronRight size={12} />
                <span className="text-primary">{activeCategory.name}</span>
              </>
            )}
          </div>
          
          <h1 className="text-6xl md:text-7xl font-display text-on-surface mb-4 tracking-tighter uppercase">
            {activeCategory ? activeCategory.name : 'ALL GEAR.'}
          </h1>
          <p className="text-on-surface-variant font-sans text-lg max-w-2xl leading-relaxed">
            {activeCategory?.description || "Engineered for excellence. Browse our complete collection of elite gaming peripherals and professional hardware."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Simplified for now) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center gap-3 mb-8 text-on-surface font-display uppercase tracking-widest text-sm">
                <SlidersHorizontal size={18} className="text-primary" />
                Filter Modules
              </div>
              
              <div className="space-y-8">
                <section>
                  <h4 className="text-on-surface-variant font-sans text-xs uppercase tracking-widest font-bold mb-4">Collections</h4>
                  <div className="flex flex-col gap-2">
                    <Link 
                      href="/products"
                      className={`text-sm font-sans py-2 px-4 rounded-lg transition-all ${!categoryParam ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                    >
                      All Products
                    </Link>
                    {categories.map(cat => {
                      const slug = cat.slug || cat.name.toLowerCase().replace(/ /g, '-');
                      const isActive = categoryParam === slug;
                      return (
                        <Link 
                          key={cat.id}
                          href={`/products?category=${slug}`}
                          className={`text-sm font-sans py-2 px-4 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                        >
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="grow">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-surface-container-low rounded-3xl border border-primary/5">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-on-surface-variant font-sans animate-pulse tracking-widest uppercase text-sm">Initializing Catalog...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32 bg-surface-container-low rounded-3xl border border-error/10">
                <AlertCircle className="text-error mb-4" size={48} />
                <p className="text-on-surface-variant font-sans text-sm uppercase tracking-widest">Protocol Failure: {error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-surface-container-low rounded-3xl border border-primary/5 text-center px-6">
                <p className="text-on-surface-variant font-sans text-lg mb-4">No gear matching these coordinates.</p>
                <Link href="/products" className="text-primary font-display uppercase tracking-widest text-xs hover:underline">Reset Navigation</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <ProductCard 
                    key={p.id}
                    id={p.id}
                    variantId={p.variants?.[0]?.id || p.id}
                    slug={p.slug}
                    name={p.name}
                    brand={p.brand?.name || 'Vanguard'}
                    category={p.category?.name || 'Gear'}
                    price={`$${p.basePrice.toLocaleString()}`}
                    imageUrl={p.images?.[0]?.url || '/placeholder.png'}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}