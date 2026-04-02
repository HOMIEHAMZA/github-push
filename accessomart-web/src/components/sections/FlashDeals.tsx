import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';

interface Deal {
  id: string;
  variantId?: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  discount: string;
}

interface FlashDealsProps {
  title: string;
  subtitle: string;
  deals: Deal[];
  timeLeft: { hours: number; minutes: number; seconds: number };
}

export function FlashDeals({ title, subtitle, deals, timeLeft }: FlashDealsProps) {
  if (!deals || deals.length === 0) return null;

  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h3 className="text-tertiary font-display text-sm uppercase tracking-[0.2em] mb-4">
              {subtitle}
            </h3>
            <div className="flex items-center gap-6">
              <h2 className="text-4xl md:text-5xl font-display text-on-surface">
                {title}
              </h2>
              
              {/* Countdown Timer */}
              <div className="hidden sm:flex items-center gap-3 bg-surface-container-highest px-6 py-3 rounded-xl border border-primary/15 shadow-[0_0_20px_rgba(143,245,255,0.05)]">
                <TimeUnit value={timeLeft.hours} label="HRS" />
                <span className="text-primary font-bold">:</span>
                <TimeUnit value={timeLeft.minutes} label="MIN" />
                <span className="text-primary font-bold">:</span>
                <TimeUnit value={timeLeft.seconds} label="SEC" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              aria-label="Previous Deals"
              className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button 
              aria-label="Next Deals"
              className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {deals.map((deal) => (
            <div key={deal.id} className="relative group">
              <div className="absolute top-4 left-4 z-20 bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                -{deal.discount}
              </div>
              <ProductCard 
                id={deal.id}
                variantId={deal.variantId}
                slug={deal.slug}
                name={deal.name}
                brand={deal.brand}
                category={deal.category}
                price={deal.price}
                imageUrl={deal.imageUrl}
              />
              <div className="mt-4 px-2">
                <span className="text-on-surface-variant line-through text-xs mr-2">{deal.originalPrice}</span>
                <span className="text-primary font-bold text-sm tracking-wide">LIMITED STOCK</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-12">
      <span className="text-2xl font-display text-primary leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] text-on-surface-variant font-bold tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
