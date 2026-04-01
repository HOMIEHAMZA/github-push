import React from 'react';
import { Star, MessageCircle, Info } from 'lucide-react';
import { Review } from '@/lib/products';

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  count: number;
}

export function ReviewsSection({ reviews, rating, count }: ReviewsSectionProps) {
  return (
    <section className="py-20 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-12 mb-16 items-start">
        {/* Rating Summary Card */}
        <div className="md:w-1/3 p-10 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl relative overflow-hidden group">
          {/* Subtle Background Icon */}
          <Star size={120} className="absolute -right-8 -bottom-8 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-700" />
          
          <h3 className="font-display text-base tracking-[0.2em] uppercase text-on-surface-variant mb-4">Pulse Baseline</h3>
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-6xl font-display text-on-surface">{rating.toFixed(1)}</span>
            <div className="flex items-center gap-1 text-primary">
              <Star size={24} fill="currentColor" />
            </div>
          </div>
          <p className="text-on-surface-variant font-sans text-sm tracking-wide">
            Based on {count} High-Density Calibrations
          </p>
        </div>

        {/* Global Review Metrics (Mock) */}
        <div className="md:w-2/3 flex flex-col gap-6 w-full">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-6 w-full group cursor-default">
              <span className="text-xs font-mono text-on-surface-variant w-4 tracking-tighter">{star} ★</span>
              <div className="flex-grow h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(143,245,255,0.4)] transition-all duration-1000 origin-left"
                  style={{ width: `${star === 5 ? 85 : star === 4 ? 12 : 1}%` }}
                />
              </div>
              <span className="text-xs font-mono text-on-surface-variant w-8 opacity-40">{star === 5 ? '85%' : star === 4 ? '12%' : '1%'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="grid grid-cols-1 gap-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className="p-8 rounded-xl bg-surface-container/30 border border-surface-container-highest/10 hover:bg-surface-container-low transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-lg text-on-surface mb-1 tracking-tight">{review.userName}</h4>
                  <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest opacity-60">Verified Origin • {review.date}</p>
                </div>
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'opacity-20'} />
                  ))}
                </div>
              </div>
              <p className="text-on-surface font-sans leading-relaxed tracking-wide italic">
                "{review.comment}"
              </p>
            </div>
          ))
        ) : (
          <div className="p-16 text-center rounded-2xl border border-dashed border-surface-container-highest/30 bg-surface-container/10">
            <MessageCircle size={40} className="mx-auto mb-4 text-on-surface-variant opacity-20" />
            <p className="text-on-surface-variant font-sans italic">Initial Baseline In Progress. No Public Calibrations Yet.</p>
          </div>
        )}
      </div>

      {/* Future-Proof Note */}
      <div className="mt-12 flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 text-[10px] text-primary font-mono uppercase tracking-[0.25em]">
        <Info size={14} />
        Review Calibration Feed Integrated for Future Uplink
      </div>
    </section>
  );
}
