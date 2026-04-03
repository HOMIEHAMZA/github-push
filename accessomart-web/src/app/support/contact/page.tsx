'use client';

import React, { useState } from "react";

export default function ContactSupport() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-bold mb-4 text-on-surface">Message Received!</h1>
        <p className="text-on-surface-variant mb-12">
          Your transmission has been received by the Accessomart network. 
          A specialist will respond within 12-24 hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-primary font-display font-bold tracking-widest hover:underline"
        >
          SEND ANOTHER MESSAGE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Info Col */}
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface">
            Contact <span className="text-primary">Support</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
            Need elite support for your gear? Our technical specialists are ready to assist with PC builds, order inquiries, and product selection.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-highest shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface mb-1">Email Transmission</h4>
                <p className="text-on-surface-variant font-mono">support@accessomart.com</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-highest shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface mb-1">Response Latency</h4>
                <p className="text-on-surface-variant">Targeting &lt; 24h response time</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-highest shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface mb-1">Operations HQ</h4>
                <p className="text-on-surface-variant">Observatory District, The Obsidian Circuit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="bg-surface-container border border-surface-container-highest rounded-3xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-display font-bold tracking-widest text-on-surface-variant uppercase ml-1">Codename / Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Required"
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-display font-bold tracking-widest text-on-surface-variant uppercase ml-1">Direct Email</label>
              <input 
                required
                type="email" 
                placeholder="Required"
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display font-bold tracking-widest text-on-surface-variant uppercase ml-1">Transmission Subject</label>
              <select className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-on-surface transition-all">
                <option>Technical Support</option>
                <option>Order Inquiries</option>
                <option>Product Inquiries</option>
                <option>Business Partnerships</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display font-bold tracking-widest text-on-surface-variant uppercase ml-1">Message Content</label>
              <textarea 
                required
                rows={4}
                placeholder="Enter details..."
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-on-surface transition-all placeholder:text-surface-variant resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-xl tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              SEND TRANSMISSION
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
