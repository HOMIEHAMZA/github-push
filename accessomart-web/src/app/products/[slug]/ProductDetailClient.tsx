'use client';

import React from 'react';
import { ApiProduct } from '@/lib/api-types';
import { ProductGallery } from '@/components/sections/ProductGallery';
import { ProductPurchaseBlock } from '@/components/sections/ProductPurchaseBlock';
import { SpecSheetGlass } from '@/components/ui/SpecSheetGlass';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: ApiProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Maps ApiProduct features to UI specs
  const images = product.images?.map(img => img.url) || [];
  const specs = product.specs?.map(spec => ({
    label: spec.specKey,
    value: spec.specValue,
    active: true,
  })) || [];
  const reviews = product.reviews || [];
  const rating = product.averageRating || 0;

  return (
    <div className="grow flex flex-col pt-24 lg:pt-32">
      <main className="grow max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        {/* Product Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Left: Gallery */}
          <div className="animate-fade-in">
            <ProductGallery images={images.length > 0 ? images : ['/placeholder.png']} productName={product.name} />
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex flex-col gap-10 animate-fade-in-up">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs font-mono tracking-[0.3em] text-primary uppercase opacity-60">
                <span>{product.category?.name || 'Electronics'}</span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>{product.brand?.name || 'Accessomart'}</span>
              </div>
              <h1 className="font-display text-4xl lg:text-6xl text-on-surface uppercase tracking-tight leading-none">
                {product.name}
              </h1>
              <p className="text-on-surface-variant font-sans text-lg leading-relaxed max-w-xl whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <ProductPurchaseBlock 
              productId={product.id}
              variants={product.variants || []}
              brand={product.brand?.name || 'Accessomart'}
              rating={product.averageRating || 0}
              reviewCount={product.reviewCount || 0}
            />
          </div>
        </div>

        {/* Technical Specifications */}
        <section className="py-24 border-t border-surface-container-highest/10 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(143,245,255,0.03),transparent_40%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-display text-3xl lg:text-4xl text-on-surface mb-4 uppercase tracking-tighter">
                Technical Calibrations.
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(143,245,255,0.4)]" />
            </div>
            
            <SpecSheetGlass 
              title="System Specification Sheet" 
              specs={specs.length > 0 ? specs : [{ label: 'Specification', value: 'N/A' }]} 
            />
          </div>
        </section>

        {/* User Reviews Section */}
        <section className="py-24 border-t border-surface-container-highest/10">
          <div className="mb-16">
            <h2 className="font-display text-3xl lg:text-4xl text-on-surface mb-4 uppercase tracking-tighter text-center">
              User Experiences.
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(143,245,255,0.4)]" />
          </div>
          
          <ReviewsSection 
            productId={product.id}
            reviews={reviews} 
            rating={rating} 
            count={product.reviewCount || reviews.length} 
          />
        </section>
      </main>
    </div>
  );
}
