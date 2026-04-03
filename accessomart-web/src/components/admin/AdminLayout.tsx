'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
}

export function AdminLayout({ children, activeItem }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Safety check: Redirect if not authenticated, or guest, or not admin
    if (mounted) {
      if (!isAuthenticated || isGuest() || user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [mounted, isAuthenticated, isGuest, user, router]);

  if (!mounted || !isAuthenticated || isGuest() || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100 selection:bg-primary/30 selection:text-primary-light">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64 p-8 lg:p-12 overflow-y-auto pt-24 lg:pt-12">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2 uppercase">
              {activeItem || 'System Overview'}
            </h1>
            <p className="text-zinc-500 text-sm">Manage your Obsidian Circuit ecosystem</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                System Active
              </span>
              <span className="text-[10px] text-zinc-600">v1.0.4-stable</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </section>
      </main>
    </div>
  );
}
