'use client';

import React, { useState } from "react";
import { supportApi } from "@/lib/api-client";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Technical Support',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await supportApi.contact(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to establish transmission. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, name } = e.target;
    setFormData(prev => ({ ...prev, [name || id]: value }));
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4 text-on-surface">Message Received!</h1>
        <p className="text-on-surface-variant mb-12">
          Your transmission has been received by the Accessomart network. 
          A specialist will respond within 12-24 hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-primary font-display font-bold tracking-widest hover:underline uppercase"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Info Col */}
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface leading-tight">
            Contact <span className="text-primary italic">Support.</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-12 leading-relaxed max-w-lg">
            Need elite support for your gear? Our technical specialists are ready to assist with PC builds, order inquiries, and product selection.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-highest shrink-0 shadow-lg shadow-primary/5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface mb-1 uppercase tracking-wide">Email Transmission</h4>
                <p className="text-on-surface-variant font-mono">support@accessomart.com</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-highest shrink-0 shadow-lg shadow-primary/5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface mb-1 uppercase tracking-wide">Response Latency</h4>
                <p className="text-on-surface-variant">Targeting &lt; 24h response time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="bg-surface-container border border-surface-container-highest rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/30 via-primary to-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-display font-bold tracking-[0.2em] text-on-surface-variant uppercase ml-1">Codename / Full Name</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text" 
                placeholder="Ex: Ghost"
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3.5 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant/40"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-display font-bold tracking-[0.2em] text-on-surface-variant uppercase ml-1">Direct Email</label>
              <input 
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                placeholder="you@domain.com"
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3.5 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-[10px] font-display font-bold tracking-[0.2em] text-on-surface-variant uppercase ml-1">Transmission Subject</label>
              <select 
                id="subject" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3.5 outline-none focus:border-primary/50 text-on-surface transition-all"
              >
                <option>Technical Support</option>
                <option>Order Inquiries</option>
                <option>Product Inquiries</option>
                <option>Business Partnerships</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-display font-bold tracking-[0.2em] text-on-surface-variant uppercase ml-1">Message Content</label>
              <textarea 
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your inquiry in detail..."
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3.5 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant/40 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-xl tracking-[0.15em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em]">Send Transmission</span>
                  <Send size={18} className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
