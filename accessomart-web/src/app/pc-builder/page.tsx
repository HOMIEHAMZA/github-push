'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePCBuilderStore } from '@/store/usePCBuilderStore';
import { builderComponents, builderCategories } from '@/lib/builder-data';
import { PCBuilderNav } from '@/components/builder/PCBuilderNav';
import { ComponentCard } from '@/components/builder/ComponentCard';
import { BuildSummary } from '@/components/builder/BuildSummary';
import { Zap, Cpu, Settings2, ShieldCheck } from 'lucide-react';

export default function PCBuilderPage() {
  const { activeCategory, setActiveCategory, selections, selectComponent } = usePCBuilderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter components by active category
  const filteredComponents = builderComponents.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-zinc-950">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] animate-pulse">
              <Zap size={12} />
              SYSTEM CONFIGURATOR V1.0
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              FORGE YOUR <span className="text-cyan-400 italic">NEXT-GEN</span> RIG
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base max-w-2xl leading-relaxed">
              Precision-engineered builder with real-time technical calibration. Select elite hardware from our curated arsenal to deploy your ultimate performance terminal.
            </p>
          </div>
        </div>
      </section>

      {/* Main Builder Interface */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Navigation (Sticky) */}
          <div className="lg:col-span-3 hidden lg:block">
            <PCBuilderNav />
          </div>

          {/* Center: Component Picker */}
          <div className="lg:col-span-6 space-y-8">
            {/* Mobile Category Scroll (Visible only on mobile) */}
            <div className="lg:hidden -mx-6 px-6 pb-4 overflow-x-auto custom-scrollbar flex gap-3">
              {builderCategories.map((cat) => (
                <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`
                     whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all
                     ${activeCategory === cat ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}
                   `}
                >
                  {cat}
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
                    Phase {builderCategories.indexOf(activeCategory) + 1} of {builderCategories.length}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hidden sm:block">
                  Verified Compatible
                </span>
              </div>

              {/* Grid of components */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                  {filteredComponents.map((component) => (
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
                  ))}
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
      <section className="bg-white/[0.02] border-t border-white/5 py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
           <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto md:mx-0">
                 <ShieldCheck className="text-cyan-400" size={24} />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Technician Verified</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-60">
                 Every selection is cross-referenced with manufacturer specifications to ensure 100% operational synergy.
              </p>
           </div>
           {/* Add more features if needed */}
        </div>
      </section>

    </div>
  );
}
