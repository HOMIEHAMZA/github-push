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
        bg-[color-mix(in_srgb,var(--color-surface-container)_60%,transparent)]
        backdrop-blur-[24px]
        border border-surface-container-highest/20
        shadow-[0_40px_80px_rgba(255,255,255,0.08)]
      `}>
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-2xl tracking-tighter text-on-surface">
          ACCESSOMART<span className="text-primary">.</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-12">
          <Link href="/products" className="text-sm font-semibold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors">Gear</Link>
          {pcBuilderSettings.showInNav && (
            <Link href="/pc-builder" className="text-sm font-semibold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors">Builder</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm font-semibold tracking-widest uppercase text-tertiary hover:text-primary transition-colors">Admin</Link>
          )}
        </div>
        
        {/* Utility / Cart */}
        <div className="flex items-center space-x-6">
          <Link href="/products" className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </Link>
          
          <button 
            onClick={openDrawer}
            className="relative text-on-surface hover:text-primary transition-colors focus:outline-none"
          >
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-on-primary text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full leading-none">
                {itemCount}
              </span>
            )}
          </button>
          
          {!isAuthenticated || isGuest() ? (
            <Link href="/login" className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center hover:border-primary transition-colors text-on-surface hover:text-primary">
              <User size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User size={16} strokeWidth={2} />
              </div>
              <button 
                onClick={() => logout()}
                className="text-xs font-bold tracking-widest uppercase text-on-surface-variant hover:text-red-400 transition-colors flex items-center gap-1"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
