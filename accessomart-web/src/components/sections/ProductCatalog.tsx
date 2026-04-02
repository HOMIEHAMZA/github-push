'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, ChevronDown, Search, Loader2, AlertCircle } from 'lucide-react';
import { productsApi } from '@/lib/api-client';
import { ApiProduct } from '@/lib/api-types';
import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from './FilterSidebar';

export function ProductCatalog() {
  // Data State
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await productsApi.list({ limit: 100 });
        if (mounted) {
          setProducts(res.products);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived Values
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category?.name).filter(Boolean) as string[])), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean) as string[])), [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const pCat = product.category?.name || 'Unknown';
      const pBrand = product.brand?.name || 'Unknown';
      const pPrice = product.basePrice;
      const pRating = 5; // Defaulting standard rating for real data mock
      
      const matchCategory = selectedCategory === 'All' || pCat === selectedCategory;
      const matchBrands = selectedBrands.length === 0 || selectedBrands.includes(pBrand);
      const matchPrice = pPrice >= priceRange[0] && pPrice <= priceRange[1];
      const matchRating = selectedRating === null || pRating >= selectedRating;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pBrand.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchBrands && matchPrice && matchRating && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return 0; // Needs review aggregation API
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
      return 0; // default featured
    });
  }, [products, selectedCategory, selectedBrands, priceRange, selectedRating, sortBy, searchQuery]);

  // Handlers
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleClearAll = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setPriceRange([0, 2000]);
    setSelectedRating(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 grow">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full mb-20">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="animate-fade-in">
            <h1 className="font-display text-4xl lg:text-5xl text-on-surface uppercase tracking-tight mb-2">
              THE CATALOG.
            </h1>
            <p className="text-on-surface-variant font-sans tracking-wide">
              {filteredProducts.length} Premium Calibrations Found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 border border-transparent focus:border-primary/20 transition-all text-on-surface"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative group min-w-48">
              <select 
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-surface-container border border-surface-container-highest/20 rounded-lg px-4 py-3 text-sm font-sans text-on-surface focus:outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="featured">Sort by Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-lg font-display text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters - Responsive */}
          <div className="lg:w-1/4">
            <FilterSidebar 
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrands={selectedBrands}
              priceRange={priceRange}
              selectedRating={selectedRating}
              onCategoryChange={setSelectedCategory}
              onBrandChange={handleBrandToggle}
              onPriceChange={(min, max) => setPriceRange([min, max])}
              onRatingChange={setSelectedRating}
              onClearAll={handleClearAll}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container/30 rounded-2xl border border-surface-container-highest/20">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-on-surface-variant font-sans animate-pulse">Interfacing with Mainframe...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container/30 rounded-2xl border border-error/20">
                <AlertCircle className="text-error mb-4" size={32} />
                <p className="text-on-surface font-sans mb-2">System Failure: Could not load catalog.</p>
                <p className="text-on-surface-variant font-sans text-sm mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-surface-container-highest text-on-surface rounded font-display text-xs tracking-widest uppercase hover:brightness-110 transition-all"
                >
                  Reboot System
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    variantId={product.variants?.[0]?.id || product.id}
                    slug={product.slug}
                    name={product.name}
                    brand={product.brand?.name || 'Unknown'}
                    category={product.category?.name || 'Unknown'}
                    price={`$${product.basePrice.toLocaleString()}`}
                    imageUrl={product.images?.[0]?.url || '/placeholder.png'}
                    rating={5}
                    isFeatured={product.isFeatured}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container/30 rounded-2xl border border-dashed border-surface-container-highest/20">
                <p className="text-on-surface-variant font-sans mb-4">No calibrations match your criteria.</p>
                <button 
                  onClick={handleClearAll}
                  className="text-primary font-display text-xs tracking-[0.2em] uppercase hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
