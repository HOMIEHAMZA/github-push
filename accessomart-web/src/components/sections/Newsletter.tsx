'use client';

import React, { useState } from 'react';
import { PrimaryButton } from '@/components/ui/Button';
import Link from 'next/link';

export function Newsletter() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-surface-container-highest p-12 lg:p-20 text-center border border-primary/5 shadow-2xl">
          {/* Subtle Glow inside the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-tertiary font-display text-sm uppercase tracking-[0.2em] mb-6">
              Stay Connected
            </h3>
            
            {isSubscribed ? (
              <div className="animate-in fade-in zoom-in duration-500 py-8">
                <h2 className="text-4xl lg:text-6xl font-display text-primary mb-6 uppercase tracking-tighter">
                  PROTOCOL ACCEPTED.
                </h2>
                <p className="text-on-surface-variant font-sans text-lg mb-8">
                  Welcome to the Obsidian Circuit. Your clearance level has been updated.
                </p>
                <PrimaryButton onClick={() => setIsSubscribed(false)} className="px-12">Return to Base</PrimaryButton>
              </div>
            ) : (
              <>
                <h2 className="text-5xl lg:text-7xl font-display text-on-surface mb-8 leading-tight">
                  JOIN THE <br className="hidden md:block"/> <span className="text-primary italic">OBSIDIAN CIRCUIT.</span>
                </h2>
                <p className="text-on-surface-variant font-sans text-lg mb-12 leading-relaxed">
                  Early access to legendary drops, exclusive firmware updates, and the latest gear calibrations. No noise, just performance.
                </p>
                
                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-surface-container-low font-sans text-sm outline-none px-6 py-4 rounded-xl border border-surface-container-highest focus:border-primary/50 text-on-surface w-full placeholder:text-surface-variant tracking-widest transition-all"
                    required
                  />
                  <PrimaryButton type="submit" className="whitespace-nowrap px-10">Access Gear</PrimaryButton>
                </form>
                
                <p className="mt-8 text-xs text-on-surface-variant/40 font-sans tracking-wide">
                  By joining, you agree to our <Link href="/privacy" className="underline hover:text-primary transition-colors">Digital Privacy Protocol</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
