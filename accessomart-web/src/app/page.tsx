'use client';

import React, { useEffect, useState } from 'react';
import { Hero } from '@/components/sections/Hero';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { FlashDeals } from '@/components/sections/FlashDeals';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { PromoBanner } from '@/components/sections/PromoBanner';
import { Newsletter } from '@/components/sections/Newsletter';
import { useAdminStore } from '@/store/useAdminStore';
import { productsApi } from '@/lib/api-client';
import { ApiProduct } from '@/lib/api-types';
import { Loader2, AlertCircle } from 'lucide-react';

// Importing refined homepage layout data (non-product config preserved)
import {
  heroData,
  categories,
  flashDealsData,
  promoData,
} from '@/lib/homepage-data';

const LoadingSection = () => (
  <div className="py-24 flex flex-col items-center justify-center bg-surface w-full">
    <Loader2 className="animate-spin text-primary mb-4" size={32} />
    <p className="text-on-surface-variant font-sans animate-pulse">Synchronizing Catalog...</p>
  </div>
);

const ErrorSection = () => (
  <div className="py-24 flex flex-col items-center justify-center bg-surface w-full">
    <AlertCircle className="text-error mb-4" size={32} />
    <p className="text-on-surface-variant font-sans text-sm">System Failure: Module Offline.</p>
  </div>
);

export default function Homepage() {
  const { homepageLayout } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  const [liveProducts, setLiveProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await productsApi.list({ limit: 50 });
        if (isSubscribed) {
          setLiveProducts(res.products);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) setError(err instanceof Error ? err.message : 'Failed to load live catalog');
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isSubscribed = false;
    };
  }, []);

  if (!mounted) return null;

  const mappedFeaturedProducts = liveProducts
    .filter((p) => p.isFeatured)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      variantId: p.variants?.[0]?.id || p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand?.name || 'Unknown',
      category: p.category?.name || 'Category',
      price: `$${p.basePrice.toLocaleString()}`,
      imageUrl: p.images?.[0]?.url || '/placeholder.png',
      isFeatured: p.isFeatured,
    }));

  const mappedFlashDeals = liveProducts
    .filter((p) => p.comparePrice && p.comparePrice > p.basePrice)
    .slice(0, 4)
    .map((p) => {
      const discountPercent = Math.round(
        ((p.comparePrice! - p.basePrice) / p.comparePrice!) * 100
      );

      return {
        id: p.id,
        variantId: p.variants?.[0]?.id || p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand?.name || 'Unknown',
        category: p.category?.name || 'Category',
        price: `$${p.basePrice.toLocaleString()}`,
        originalPrice: `$${p.comparePrice!.toLocaleString()}`,
        imageUrl: p.images?.[0]?.url || '/placeholder.png',
        discount: `${discountPercent}%`,
      };
    });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="grow">
        {homepageLayout.map((section) => {
          if (!section.enabled) return null;

          switch (section.id) {
            case 'hero':
              return <Hero key="hero" {...heroData} />;
            case 'categories':
              return (
                <CategoryGrid
                  key="categories"
                  title="CURATED GEAR."
                  subtitle="Explore our Collections"
                  categories={categories}
                />
              );
            case 'flash':
              if (isLoading) return <LoadingSection key="flash-loading" />;
              if (error) return <ErrorSection key="flash-error" />;
              return (
                <FlashDeals
                  key="flash"
                  title={flashDealsData.title}
                  subtitle={flashDealsData.subtitle}
                  timeLeft={flashDealsData.timeLeft}
                  deals={mappedFlashDeals}
                />
              );
            case 'promo':
              return <PromoBanner key="promo" {...promoData} />;
            case 'featured':
              if (isLoading) return <LoadingSection key="featured-loading" />;
              if (error) return <ErrorSection key="featured-error" />;
              return (
                <FeaturedProducts
                  key="featured"
                  title="LEGENDARY TIER."
                  subtitle="Featured Accessories"
                  products={mappedFeaturedProducts}
                />
              );
            case 'newsletter':
              return <Newsletter key="newsletter" />;
            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}