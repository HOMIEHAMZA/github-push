'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';

export function GlassNavbar() {
  const { getTotalItems, openDrawer } = useCartStore();
  const { pcBuilderSettings } = useAdminStore();
  const { user, isGuest, isAuthenticated, logout } = useAuthStore();
  const itemCount = getTotalItems();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6">
      <nav className={`
        w-full max-w-7xl flex items-center justify-between
        px-8 py-4 rounded-2xl
        bg-[color-mix(in_srgb,var(--color-surface-container)_80%,transparent)]
        backdrop-blur-md
        border border-primary/20
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
      `}>
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center justify-center group">
          <svg className="w-8 h-8 text-primary mb-1 group-hover:scale-105 transition-transform duration-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5L15 9.5L22.5 11.5L17 15.5L18.5 22.5L12 18.5L5.5 22.5L7 15.5L1.5 11.5L9 9.5L12 2.5Z" opacity="0.9" />
            <circle cx="12" cy="7" r="2" fill="var(--color-on-surface)" />
          </svg>
          <div className="font-display font-medium text-primary text-xl tracking-wider uppercase leading-none">Accesso</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-4 bg-primary/40"></div>
            <div className="text-primary text-[10px] tracking-[0.4em] uppercase font-bold leading-none">Mart</div>
            <div className="h-[1px] w-4 bg-primary/40"></div>
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-12">
          <Link href="/products" className="text-sm font-medium tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors duration-300">Gear</Link>
          {pcBuilderSettings.showInNav && (
            <Link href="/pc-builder" className="text-sm font-medium tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors duration-300">Builder</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm font-medium tracking-widest uppercase text-tertiary hover:text-primary transition-colors duration-300">Admin</Link>
          )}
        </div>
        
        {/* Utility / Cart */}
        <div className="flex items-center space-x-6">
          <Link href="/products" className="text-on-surface-variant hover:text-primary transition-colors duration-300 focus:outline-none">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          
          <button 
            onClick={openDrawer}
            className="relative text-on-surface hover:text-primary transition-colors duration-300 focus:outline-none"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-on-primary text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full leading-none">
                {itemCount}
              </span>
            )}
          </button>
          
          {!isAuthenticated || isGuest() ? (
            <Link href="/login" className="w-10 h-10 rounded-full bg-surface-container border border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all duration-300 text-on-surface hover:text-primary">
              <User size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <div className="flex items-center gap-3 border-l border-primary/20 pl-4 ml-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <User size={16} strokeWidth={1.5} />
              </div>
              <button 
                onClick={() => logout()}
                className="text-xs font-medium tracking-widest uppercase text-on-surface-variant hover:text-red-400 transition-colors duration-300 flex items-center gap-1"
                title="Log Out"
              >
                <LogOut size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
