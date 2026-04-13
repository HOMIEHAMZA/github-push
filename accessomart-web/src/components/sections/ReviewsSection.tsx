'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, Info, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { ApiReview } from '@/lib/api-types';
import { useAuthStore } from '@/store/useAuthStore';
import { productsApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface ReviewsSectionProps {
  productId: string;
  reviews: ApiReview[];
  rating: number;
  count: number;
}

export function ReviewsSection({ productId, reviews, rating, count }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const [formRating, setFormRating] = useState(5);
  const [formBody, setFormBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Calculate distributions if reviews exist
  const distribution = [0, 0, 0, 0, 0];
  if (reviews.length > 0) {
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBody.trim()) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (editingReviewId) {
        await productsApi.updateReview(productId, editingReviewId, { rating: formRating, body: formBody });
        setSuccess('Calibration uplink updated successfully.');
        setEditingReviewId(null);
      } else {
        await productsApi.submitReview(productId, { rating: formRating, body: formBody });
        setSuccess('Calibration uplink transmitted successfully.');
      }
      setFormBody('');
      setFormRating(5);
      router.refresh();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      let message = err.message || 'Failed to submit review';
      try {
        const parsed = JSON.parse(message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          message = parsed[0].message;
        }
      } catch {
        // Not a JSON error, use original message
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (review: ApiReview) => {
    setEditingReviewId(review.id);
    setFormRating(review.rating);
    setFormBody(review.body || '');
    setError('');
    setSuccess('');
    window.scrollTo({ top: document.getElementById('review-form')?.offsetTop ? document.getElementById('review-form')!.offsetTop - 100 : 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setFormRating(5);
    setFormBody('');
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to purge this calibration data? This action is irreversible.')) return;
    
    try {
      await productsApi.deleteReview(productId, reviewId);
      setSuccess('Calibration purged from databanks.');
      router.refresh();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    }
  };

  return (
    <section className="py-20 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-12 mb-16 items-start">
        {/* Rating Summary Card */}
        <div className="md:w-1/3 p-10 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl relative overflow-hidden group">
          <Star size={120} className="absolute -right-8 -bottom-8 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-700" />
          
          <h3 className="font-display text-base tracking-[0.2em] uppercase text-on-surface-variant mb-4">Pulse Baseline</h3>
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-6xl font-display text-on-surface">{rating ? rating.toFixed(1) : '0.0'}</span>
            <div className="flex items-center gap-1 text-primary">
              <Star size={24} fill="currentColor" />
            </div>
          </div>
          <p className="text-on-surface-variant font-sans text-sm tracking-wide">
            Based on {count} High-Density Calibrations
          </p>
        </div>

        {/* Global Review Metrics (Dynamic) */}
        <div className="md:w-2/3 flex flex-col gap-6 w-full">
          {reviews.length > 0 ? (
            [5, 4, 3, 2, 1].map((star) => {
              const starCount = distribution[star - 1];
              const pct = count > 0 ? Math.round((starCount / count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-6 w-full group cursor-default">
                  <span className="text-xs font-mono text-on-surface-variant w-4 tracking-tighter">{star} ★</span>
                  <div className="flex-grow h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary shadow-[0_0_10px_rgba(143,245,255,0.4)] transition-all duration-1000 origin-left"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant w-8 opacity-40">{pct}%</span>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center p-8 border border-dashed border-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-widest rounded-xl">
              Distribution metrics waiting for initial data
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Review List */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div 
                key={review.id} 
                className="p-8 rounded-xl bg-surface-container/30 border border-surface-container-highest/10 hover:bg-surface-container-low transition-colors duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-display text-lg text-on-surface mb-1 tracking-tight flex items-center gap-2">
                      {review.user?.firstName || 'Anonymous'}
                      {review.userId === user?.id && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>
                      )}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest opacity-60">Verified Origin • {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'opacity-20'} />
                      ))}
                    </div>
                    {review.userId === user?.id && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(review)}
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg border border-surface-container-highest/10"
                          title="Edit Calibration"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-on-surface-variant hover:text-red-400 transition-colors bg-surface-container rounded-lg border border-surface-container-highest/10"
                          title="Purge Calibration"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-on-surface font-sans leading-relaxed tracking-wide italic whitespace-pre-wrap">
                  "{review.body}"
                </p>
              </div>
            ))
          ) : (
            <div className="p-16 text-center rounded-2xl border border-dashed border-surface-container-highest/30 bg-surface-container/10">
              <MessageCircle size={40} className="mx-auto mb-4 text-on-surface-variant opacity-20" />
              <p className="text-on-surface-variant font-sans italic">Initial Baseline In Progress. Be the first to calibrate.</p>
            </div>
          )}
        </div>

        {/* Right Col: Submit Review Form */}
        <div className="lg:col-span-1" id="review-form">
          <div className="p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display text-xl text-on-surface uppercase tracking-tight">
                {editingReviewId ? 'Edit Calibration' : 'Add Calibration'}
              </h4>
              {editingReviewId && (
                <button onClick={cancelEdit} className="text-on-surface-variant hover:text-on-surface transition-colors" title="Cancel Edit">
                  <X size={20} />
                </button>
              )}
            </div>
            
            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && <div className="p-4 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono uppercase tracking-widest rounded-lg">{error}</div>}
                {success && <div className="p-4 bg-primary/10 border border-primary/40 text-primary text-xs font-mono uppercase tracking-widest rounded-lg">{success}</div>}
                
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className={`p-2 transition-all duration-300 ${formRating >= star ? 'text-primary scale-110' : 'text-on-surface-variant opacity-40 hover:opacity-100 hover:scale-110'}`}
                      >
                        <Star size={24} fill={formRating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-3">Experience</label>
                  <textarea
                    required
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest/20 rounded-xl p-4 text-on-surface font-sans focus:outline-none focus:border-primary/50 transition-colors resize-none min-h-[120px]"
                    placeholder="Calibrate the pulse..."
                  />
                </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formBody.trim()}
                    className="w-full py-4 rounded-xl bg-primary text-on-primary font-display uppercase tracking-widest hover:shadow-[0_0_20px_rgba(143,245,255,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editingReviewId ? 'Update Calibration' : 'Submit Uplink'}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-full py-4 rounded-xl border border-surface-container-highest/20 text-on-surface-variant font-display uppercase tracking-widest hover:bg-surface-container-highest/10 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-sans text-on-surface-variant mb-6">You must establish a secure connection to input calibration data.</p>
                <div onClick={() => router.push('/login')} className="cursor-pointer inline-block px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-sm uppercase tracking-widest hover:bg-primary/10 transition-colors">
                  Log in to review
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
