'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi, brandsApi } from '@/lib/api-client';
import { ApiProduct, ApiCategory, ApiBrand } from '@/lib/api-types';
import { ProductCard } from '@/components/ui/ProductCard';
import { Loader2, AlertCircle, SlidersHorizontal, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const searchParam = searchParams.get('search');
  const sortParam = searchParams.get('sort') as any;
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [localSearch, setLocalSearch] = useState(searchParam || '');
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam || '');

  // update local states when URL changes (e.g. from back btn)
  useEffect(() => {
    setLocalSearch(searchParam || '');
    setLocalMinPrice(minPriceParam || '');
    setLocalMaxPrice(maxPriceParam || '');
  }, [searchParam, minPriceParam, maxPriceParam]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: localSearch || null });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ 
      minPrice: localMinPrice || null, 
      maxPrice: localMaxPrice || null 
    });
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          productsApi.list({ 
            category: categoryParam || undefined, 
            brand: brandParam || undefined,
            search: searchParam || undefined,
            sort: sortParam || undefined,
            minPrice: minPriceParam ? Number(minPriceParam) : undefined,
            maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
            limit: 100 
          }),
          categoriesApi.list(),
          brandsApi.list()
        ]);
        
        if (isSubscribed) {
          setProducts(productsRes.products);
          setCategories(categoriesRes.categories);
          setBrands(brandsRes.brands);
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
  }, [categoryParam, brandParam, searchParam, sortParam, minPriceParam, maxPriceParam]);

  const activeCategory = categories.find(c => 
    c.slug === categoryParam || c.name.toLowerCase().replace(/ /g, '-') === categoryParam
  );

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
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
            
            {/* Sort Selector */}
            <div className="shrink-0 flex items-center gap-3">
              <label className="text-on-surface-variant text-xs uppercase tracking-widest font-bold hidden sm:block">Sort By</label>
              <select 
                title="Sort Products"
                value={sortParam || 'newest'}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-surface-container border border-surface-container-highest/20 text-on-surface text-sm rounded-lg px-4 py-2 outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="flex items-center gap-3 text-on-surface font-display uppercase tracking-widest text-sm">
                <SlidersHorizontal size={18} className="text-primary" />
                Filter Modules
              </div>
              
              {/* Search */}
              <section>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input 
                    type="text" 
                    placeholder="Search gear..." 
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest/20 rounded-lg pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder-on-surface-variant/50"
                  />
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <button type="submit" className="hidden">Submit</button>
                </form>
              </section>

              {/* Collections */}
              <section>
                <h4 className="text-on-surface-variant font-sans text-xs uppercase tracking-widest font-bold mb-4">Collections</h4>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => updateFilters({ category: null })}
                    className={`text-left text-sm font-sans py-2 px-4 rounded-lg transition-all ${!categoryParam ? 'bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent hover:border-white/5'}`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => {
                    const slug = cat.slug || cat.name.toLowerCase().replace(/ /g, '-');
                    const isActive = categoryParam === slug;
                    return (
                      <button 
                        key={cat.id}
                        onClick={() => updateFilters({ category: slug })}
                        className={`text-left text-sm font-sans py-2 px-4 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent hover:border-white/5'}`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Brands */}
              {brands.length > 0 && (
                <section>
                  <h4 className="text-on-surface-variant font-sans text-xs uppercase tracking-widest font-bold mb-4">Manufacturers</h4>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => updateFilters({ brand: null })}
                      className={`text-left text-sm font-sans py-2 px-4 rounded-lg transition-all ${!brandParam ? 'bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent hover:border-white/5'}`}
                    >
                      All Brands
                    </button>
                    {brands.map(brand => {
                      const slug = brand.slug || brand.name.toLowerCase().replace(/ /g, '-');
                      const isActive = brandParam === slug;
                      return (
                        <button 
                          key={brand.id}
                          onClick={() => updateFilters({ brand: slug })}
                          className={`text-left text-sm font-sans py-2 px-4 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent hover:border-white/5'}`}
                        >
                          {brand.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Price Range */}
              <section>
                <h4 className="text-on-surface-variant font-sans text-xs uppercase tracking-widest font-bold mb-4">Price Range</h4>
                <form onSubmit={handlePriceSubmit} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      title="Min Price"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-highest/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder-on-surface-variant/40"
                    />
                    <span className="text-on-surface-variant">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      title="Max Price"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-highest/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder-on-surface-variant/40"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-surface-container hover:bg-primary/20 hover:text-primary transition-colors text-on-surface-variant text-xs font-bold uppercase tracking-widest py-3 rounded-lg border border-surface-container-highest/20 hover:border-primary/50"
                  >
                    Apply Range
                  </button>
                </form>
              </section>

              {/* Clear All */}
              {(categoryParam || brandParam || searchParam || minPriceParam || maxPriceParam || sortParam) && (
                <section className="pt-4 border-t border-surface-container-highest/10">
                  <button 
                    onClick={() => router.push(pathname)}
                    className="w-full text-center text-xs font-bold uppercase tracking-widest text-error/80 hover:text-error transition-colors py-2 bg-error/5 hover:bg-error/10 rounded-lg border border-error/20"
                  >
                    Clear All Filters
                  </button>
                </section>
              )}

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
                <button onClick={() => router.push(pathname)} className="text-primary font-display uppercase tracking-widest text-xs hover:underline">Reset Navigation</button>
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