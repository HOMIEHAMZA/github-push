'use client';
import React from 'react';
import { ShieldCheck, Truck, Headset } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <footer className="bg-surface-container-lowest pt-20 pb-10 border-t border-surface-container mt-auto">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Area */}
        <div className="col-span-1 md:col-span-1 flex flex-col items-start pr-8 border-r border-surface-container/50">
          <Link href="/" className="font-display font-bold text-3xl tracking-tighter text-on-surface mb-6">
            ACCESSOMART<span className="text-primary">.</span>
          </Link>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
            The digital curator for elite electronics and gaming gear. Built for performance without compromise.
          </p>
        </div>

        {/* Links 1 - Catalog */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-on-surface text-lg font-medium mb-2 tracking-wide font-bold uppercase text-xs tracking-[0.2em] text-primary">Catalog</h4>
          <Link href="/products" className="text-on-surface-variant hover:text-primary transition-colors text-sm">New Arrivals</Link>
          <Link href="/products?category=gaming" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Gaming Gear</Link>
          <Link href="/pc-builder" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Custom PC Builder</Link>
          <Link href="/products?featured=true" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Legendary Tier</Link>
        </div>

        {/* Links 2 - Support */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-on-surface text-lg font-medium mb-2 tracking-wide font-bold uppercase text-xs tracking-[0.2em] text-primary">Support</h4>
          <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold">About Us</Link>
          <Link href="/account/orders" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Order Status</Link>
          <Link href="/support/returns" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Returns & Exchanges</Link>
          <Link href="/support/faq" className="text-on-surface-variant hover:text-primary transition-colors text-sm">FAQ</Link>
          <Link href="/support/contact" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Contact Us</Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col space-y-4">
          <h4 className="font-display text-on-surface text-lg font-medium mb-2 tracking-wide font-bold uppercase text-xs tracking-[0.2em] text-primary">The Obsidian Circuit</h4>
          <p className="text-on-surface-variant text-sm mb-4">
            Join our newsletter for early access to legendary drops and exclusive gear.
          </p>
          {!subscribed ? (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="flex w-full"
            >
              <input 
                type="email" 
                required
                placeholder="YOUR EMAIL" 
                className="bg-surface-container font-sans text-sm outline-none px-4 py-3 rounded-l-xl border border-r-0 border-surface-container-highest focus:border-primary/50 text-on-surface w-full placeholder:text-surface-variant tracking-widest"
              />
              <button 
                type="submit"
                className="bg-primary text-on-primary font-bold px-4 py-3 rounded-r-xl tracking-widest hover:brightness-110 transition-all uppercase text-[10px]"
              >
                JOIN
              </button>
            </form>
          ) : (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
                PROTOCOL JOINED
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trust Block Row */}
      <div className="max-w-7xl mx-auto px-8 mt-16 py-8 border-y border-surface-container/30 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Secure Assets</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider">SSL Secure & Protected Payments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:scale-110 transition-transform duration-500">
            <Truck size={24} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Rapid Logistics</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider">Global Shipping & Carrier Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:scale-110 transition-transform duration-500">
            <Headset size={24} />
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-1">Unified Support</h5>
            <p className="text-[10px] text-on-surface-variant tracking-wider">Dedicated Service & Warranty Portal</p>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-8 mt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-on-surface-variant/40 tracking-widest font-mono">
        <p>&copy; {new Date().getFullYear()} Accessomart Ecosystem. All protocols reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 font-medium uppercase tracking-[0.2em]">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
