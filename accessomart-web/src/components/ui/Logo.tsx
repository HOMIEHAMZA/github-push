import React from 'react';
import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex flex-col items-center justify-center group ${className}`}>
      {/* Phoenix/Wing Mark */}
      <svg 
        className="w-14 h-12 mb-1 group-hover:scale-105 transition-transform duration-500" 
        viewBox="0 0 100 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Antenna/Line */}
        <rect x="49" y="8" width="2" height="6" fill="var(--color-on-surface)" opacity="0.8" />
        
        {/* Glowing Orb */}
        <circle cx="50" cy="22" r="5" fill="var(--color-on-surface)" />
        
        {/* Central Body (Diamond/Teardrop) */}
        <path d="M50 30 C56 40 58 50 50 68 C42 50 44 40 50 30 Z" fill="url(#phoenixGold)" />
        
        {/* Left Wing Outer */}
        <path d="M47 55 C35 40 20 25 10 15 C25 25 35 35 43 60 Z" fill="url(#phoenixGold)" />
        
        {/* Right Wing Outer */}
        <path d="M53 55 C65 40 80 25 90 15 C75 25 65 35 57 60 Z" fill="url(#phoenixGold)" />
        
        {/* Left Wing Inner Highlight */}
        <path d="M45 52 C35 40 25 32 18 28 C26 32 32 38 41 55 Z" fill="var(--color-primary-fixed-dim)" opacity="0.7" />
        
        {/* Right Wing Inner Highlight */}
        <path d="M55 52 C65 40 75 32 82 28 C74 32 68 38 59 55 Z" fill="var(--color-primary-fixed-dim)" opacity="0.7" />

        <defs>
          <linearGradient id="phoenixGold" x1="50" y1="15" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-primary-fixed-dim)" /> {/* Light Gold */}
            <stop offset="35%" stopColor="var(--color-primary)" /> {/* Brand Gold */}
            <stop offset="100%" stopColor="var(--color-primary-dim)" /> {/* Deep Gold */}
          </linearGradient>
        </defs>
      </svg>
      
      {/* Wordmark */}
      <div className="font-display font-medium text-primary text-2xl tracking-wider uppercase leading-none">
        Accesso
      </div>
      
      {/* Separator and MART */}
      <div className="flex items-center gap-3 mt-1.5 opacity-80">
        <div className="h-[1px] w-8 bg-primary/40"></div>
        <div className="w-1.5 h-1.5 rotate-45 bg-primary/60"></div>
        <div className="h-[1px] w-8 bg-primary/40"></div>
      </div>
      <div className="text-primary text-[10px] tracking-[0.6em] uppercase font-bold leading-none mt-1.5 opacity-70 ml-1">
        Mart
      </div>
    </Link>
  );
}
