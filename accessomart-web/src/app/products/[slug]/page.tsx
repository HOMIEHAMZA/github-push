import React from 'react';
import { Metadata } from 'next';
import { productsApi } from '@/lib/api-client';
import ProductDetailClient from './ProductDetailClient';
import { ProductCard } from '@/components/ui/ProductCard';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ApiProduct } from '@/lib/api-types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await productsApi.get(slug);
    const images = product.images?.map(img => img.url) || [];

    return {
      title: `${product.name} | Accessomart`,
      description: product.description?.slice(0, 160) || 'Premium tech accessories for the Accessomart ecosystem.',
      openGraph: {
        title: product.name,
        description: product.description,
        images: images.length > 0 ? [{ url: images[0] }] : [],
      },
    };
  } catch {
    return {
      title: 'Product Not Found | Accessomart',
    };
  }
}

export async function generateStaticParams() {
  try {
    const res = await productsApi.list({ limit: 100 });
    return res.products.map((p) => ({
      slug: p.slug,
    }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const { product } = await productsApi.get(slug);

    // Fetch related products from the same category
    let relatedProducts: ApiProduct[] = [];
    if (product.category?.slug) {
      try {
        const { products } = await productsApi.list({ 
          category: product.category.slug,
          limit: 10 // Fetch enough to filter current and still have 4
        });
        relatedProducts = products
          .filter(p => p.id !== product.id)
          .slice(0, 4);
      } catch (err) {
        console.error('[Related Products] Fetch error:', err);
      }
    }

    // JSON-LD for SEO rich results
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.map(img => img.url) || [],
      description: product.description || 'Premium tech accessories.',
      brand: {
        '@type': 'Brand',
        name: product.brand?.name || 'Accessomart',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        offerCount: product.variants?.length || 1,
        lowPrice: Math.min(...(product.variants?.map(v => Number(v.price || 0)) || [0])),
        highPrice: Math.max(...(product.variants?.map(v => Number(v.price || 0)) || [0])),
        availability: product.variants?.some(v => (v.inventory?.quantity || 0) > 0) 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5', // Default since rating isn't in API yet
        reviewCount: product._count?.reviews || '0',
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetailClient product={product} />

        {/* Recommended Gear Section */}
        {relatedProducts.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-16 lg:py-24 border-t border-surface-container-highest/10">
            <h2 className="text-xl lg:text-2xl font-display text-on-surface mb-10 tracking-[0.2em] uppercase">
              Recommended Gear
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(related => {
                 // Use first variant price if available, fallback to base price
                 const displayPrice = related.variants?.[0]?.price || related.basePrice || 0;
                 const comparePrice = related.variants?.[0]?.comparePrice || related.comparePrice;
                 
                 return (
                  <ProductCard
                    key={related.id}
                    id={related.id}
                    slug={related.slug}
                    name={related.name}
                    brand={related.brand?.name || 'Accessomart'}
                    category={related.category?.name || 'General'}
                    price={displayPrice}
                    originalPrice={comparePrice}
                    imageUrl={related.images?.find(img => img.isPrimary)?.url || related.images?.[0]?.url || ''}
                  />
                );
              })}
            </div>
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error('[Product Page] SSR Error:', error);
    return (
      <div className="grow flex flex-col pt-24 lg:pt-32">
        <main className="grow max-w-[1440px] mx-auto px-6 lg:px-12 w-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-16 text-center bg-surface-container/30 rounded-2xl border border-error/20 mx-auto w-full max-w-lg mt-32">
            <AlertCircle className="text-error mb-4" size={48} />
            <p className="text-on-surface font-sans mb-2">System Failure: Module offline.</p>
            <p className="text-on-surface-variant font-sans text-sm mb-6">The calibration data for this product is currently unavailable.</p>
            <Link 
              href="/products"
              className="px-6 py-2 bg-surface-container-highest text-on-surface rounded font-display text-xs tracking-widest uppercase hover:brightness-110 transition-all inline-block"
            >
              Return to Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }
}
