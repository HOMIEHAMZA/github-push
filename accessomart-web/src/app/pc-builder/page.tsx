'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePCBuilderStore } from '@/store/usePCBuilderStore';
import { ApiCategory, ApiProduct } from '@/lib/api-types';
import { PCBuilderNav } from '@/components/builder/PCBuilderNav';
import { ComponentCard } from '@/components/builder/ComponentCard';
import { BuildSummary } from '@/components/builder/BuildSummary';
import { Zap, Cpu, Settings2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function PCBuilderPage() {
  const { 
    categories, 
    activeCategory, 
    setActiveCategory, 
    selections, 
    selectComponent,
    isLoading,
    error,
    fetchComponents
  } = usePCBuilderStore();
  
  // Correct hydration pattern
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchComponents();
    }
  }, [isClient, fetchComponents]);

  if (!isClient) return null;

  // Find components for the active category
  const activeCategoryData = categories.find(c => c.name === activeCategory);
  const filteredComponents = (activeCategoryData as ApiCategory & { products: ApiProduct[] })?.products || [];

  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" strokeWidth={1} />
          <div className="absolute inset-0 blur-2xl bg-cyan-500/20 animate-pulse" />
        </div>
        <p className="text-cyan-500/50 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
          INITIALIZING HARDWARE ENGINE...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 animate-pulse rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              <Zap size={12} />
              SYSTEM CONFIGURATOR V2.0
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              FORGE YOUR <span className="text-cyan-400 italic">NEXT-GEN</span> RIG
            </h1>
            <p className="text-zinc-500 text-sm md:text-base max-w-2xl leading-relaxed uppercase tracking-wider">
              Precision-engineered builder with real-time technical calibration. Access our live database of elite hardware to deploy your ultimate performance terminal.
            </p>
          </div>
        </div>
      </section>

      {/* Main Builder Interface */}
      <section className="container mx-auto px-6 pb-24">
        {error && (
          <div className="mb-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 max-w-2xl mx-auto backdrop-blur-sm">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold uppercase tracking-widest text-xs">Engine Failure</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
              onClick={() => fetchComponents()}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
            >
              Re-initialize
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Navigation (Sticky) */}
          <div className="lg:col-span-3 hidden lg:block">
            <PCBuilderNav />
          </div>

          {/* Center: Component Picker */}
          <div className="lg:col-span-6 space-y-8">
            {/* Mobile Category Scroll (Visible only on mobile) */}
            <div className="lg:hidden -mx-6 px-6 pb-4 overflow-x-auto custom-scrollbar flex gap-3">
              {categories.map((cat) => (
                 <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`
                      whitespace-nowrap rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all
                      ${activeCategory === cat.name ? 'border-cyan-500 bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/10'}
                    `}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                    {activeCategory === 'CPU' && <Cpu className="text-cyan-400" size={24} />}
                    {activeCategory === 'GPU' && <Zap className="text-cyan-400" size={24} />}
                    {activeCategory !== 'CPU' && activeCategory !== 'GPU' && <Settings2 className="text-cyan-400" size={24} />}
                    {activeCategory} Arsenal
                  </h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Live Component Feed • {filteredComponents.length} Options
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    CALIBRATED {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Grid of components */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                  {filteredComponents.length > 0 ? filteredComponents.map((component: ApiProduct) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ComponentCard
                        component={component}
                        isSelected={selections[activeCategory] === component.id}
                        onSelect={(id) => selectComponent(activeCategory, id)}
                      />
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">
                        NO {activeCategory} ASSETS IN DATABASE
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Build Summary (Sticky) */}
          <div className="lg:col-span-3">
            <BuildSummary />
          </div>
        </div>
      </section>

      {/* Feature Footer */}
      <section className="bg-white/2 border-t border-white/5 py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-4">
               <div className="flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 w-12 h-12 mx-auto md:mx-0">
                  <ShieldCheck className="text-cyan-400" size={24} />
               </div>
               <h4 className="text-sm font-bold uppercase tracking-widest text-white">Technician Verified</h4>
               <p className="text-xs leading-relaxed opacity-60 text-on-surface-variant uppercase tracking-wider">
                  Every selection is cross-referenced with manufacturer specifications to ensure 100% operational synergy within the Accessomart ecosystem.
               </p>
            </div>
        </div>
      </section>

    </div>
  );
}
