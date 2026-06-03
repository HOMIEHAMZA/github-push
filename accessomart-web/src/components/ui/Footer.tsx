'use client';
import React from 'react';
import { ShieldCheck, Truck, Headset } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <footer className="bg-surface pt-20 pb-10 border-t border-primary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Area */}
        <div className="col-span-1 md:col-span-1 flex flex-col items-start pr-8 border-r border-primary/10">
          <Link href="/" className="flex flex-col items-start group mb-6">
            <svg className="w-10 h-10 text-primary mb-2 group-hover:scale-105 transition-transform duration-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5L15 9.5L22.5 11.5L17 15.5L18.5 22.5L12 18.5L5.5 22.5L7 15.5L1.5 11.5L9 9.5L12 2.5Z" opacity="0.9" />
              <circle cx="12" cy="7" r="2" fill="var(--color-on-surface)" />
            </svg>
            <div className="font-display font-medium text-primary text-2xl tracking-wider uppercase leading-none">Accesso</div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-[1px] w-6 bg-primary/40"></div>
              <div className="text-primary text-xs tracking-[0.4em] uppercase font-bold leading-none">Mart</div>
              <div className="h-[1px] w-6 bg-primary/40"></div>
            </div>
          </Link>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs font-light">
            The digital curator for elite electronics and gaming gear. Built for performance without compromise.
          </p>
        </div>

        {/* Links 1 - Catalog */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-sans text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">Catalog</h4>
          <Link href="/products" className="text-on-surface-variant hover:text-primary transition-colors text-sm">New Arrivals</Link>
          <Link href="/products?category=gaming" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Gaming Gear</Link>
          <Link href="/pc-builder" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Custom PC Builder</Link>
          <Link href="/products?featured=true" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Legendary Tier</Link>
        </div>

        {/* Links 2 - Support */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-sans text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">Support</h4>
          <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">About Us</Link>
          <Link href="/account/orders" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Order Status</Link>
          <Link href="/support/returns" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Returns & Exchanges</Link>
          <Link href="/support/faq" className="text-on-surface-variant hover:text-primary transition-colors text-sm">FAQ</Link>
          <Link href="/support/contact" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Contact Us</Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-sans text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">The Obsidian Circuit</h4>
          <p className="text-on-surface-variant text-sm mb-4 font-light">
            Join our newsletter for early access to legendary drops and exclusive gear.
          </p>
          {!subscribed ? (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="flex w-full group"
            >
              <input 
                type="email" 
                required
                placeholder="YOUR EMAIL" 
                className="bg-surface-container font-sans text-sm outline-none px-4 py-3 rounded-l-md border border-r-0 border-primary/20 focus:border-primary text-on-surface w-full placeholder:text-surface-variant tracking-widest transition-colors"
              />
              <button 
                type="submit"
                className="bg-primary text-on-primary font-bold px-5 py-3 rounded-r-md tracking-[0.2em] hover:brightness-110 transition-all uppercase text-[10px]"
              >
                JOIN
              </button>
            </form>
          ) : (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
                PROTOCOL JOINED
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trust Block Row */}
      <div className="max-w-7xl mx-auto px-8 mt-16 py-8 border-y border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-3 bg-surface-container border border-primary/20 rounded-lg text-primary group-hover:scale-105 transition-transform duration-500">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Secure Assets</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider font-light">SSL Secure & Protected Payments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-3 bg-surface-container border border-primary/20 rounded-lg text-primary group-hover:scale-105 transition-transform duration-500">
            <Truck size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Rapid Logistics</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider font-light">Global Shipping & Carrier Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-3 bg-surface-container border border-primary/20 rounded-lg text-primary group-hover:scale-105 transition-transform duration-500">
            <Headset size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Unified Support</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider font-light">Dedicated Service & Warranty Portal</p>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-8 mt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-on-surface-variant/40 tracking-widest font-sans">
        <p>&copy; {new Date().getFullYear()} Accessomart Ecosystem. All protocols reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 font-medium uppercase tracking-[0.2em]">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
