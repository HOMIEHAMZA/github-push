'use client';

import React from 'react';
import { usePCBuilderStore } from '@/store/usePCBuilderStore';
import { useCartStore } from '@/store/useCartStore';
import { AlertCircle, ArrowRight, Trash2, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BuildSummary: React.FC = () => {
  const { selections, getSelections, getTotalPrice, getCompatibilityWarnings, clearBuild } = usePCBuilderStore();
  const [isAdding, setIsAdding] = React.useState(false);

  const selectedComponents = getSelections();
  const totalPrice = getTotalPrice();
  const warnings = getCompatibilityWarnings();

  const handleAddBundle = async () => {
    if (selectedComponents.length === 0) return;
    setIsAdding(true);
    try {
      // TODO: Implement backend builder-to-cart migration when PC Builder API is ready
      alert("PC Builder API Integration coming soon!");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-surface-container-low border border-surface-container-highest/10 rounded-3xl sticky top-40 shadow-2xl overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-on-surface tracking-tight uppercase">Build Summary</h2>
        <button 
          onClick={clearBuild}
          className="p-2 text-on-surface-variant hover:text-red-400 transition-colors"
          title="Clear Loadout"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Selected Components List (Compact) */}
      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {selectedComponents.length > 0 ? (
          selectedComponents.map((c) => (
            <div key={c.id} className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{c.category}</span>
                <span className="text-on-surface font-medium truncate">{c.name}</span>
              </div>
              <span className="font-mono text-on-surface-variant flex-shrink-0">${c.price.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-on-surface-variant/40 space-y-2">
            <Zap size={24} className="mx-auto opacity-20" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Initializing Loadout...</p>
          </div>
        )}
      </div>

      {/* Compatibility Warnings */}
      <div className="space-y-3">
        {warnings.length > 0 ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Compatibility Alerts</span>
            </div>
            {warnings.map((w, idx) => (
              <p key={idx} className="text-[10px] text-red-400/80 leading-relaxed">• {w}</p>
            ))}
          </div>
        ) : selectedComponents.length > 0 && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400">
            <Zap size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">System Calibrated</span>
          </div>
        )}
      </div>

      {/* Totals & Action */}
      <div className="pt-6 border-t border-surface-container-highest/10 space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Est. Build Total</span>
          <span className="text-2xl font-bold text-primary font-mono">${totalPrice.toFixed(2)}</span>
        </div>
        
        <button
          onClick={handleAddBundle}
          disabled={selectedComponents.length === 0 || warnings.length > 0}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm transition-all group",
            selectedComponents.length > 0 && warnings.length === 0
              ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] active:scale-95"
              : "bg-surface-container-highest/20 text-on-surface-variant cursor-not-allowed"
          )}
        >
          {warnings.length > 0 ? "Resolve Conflicts" : "Deploy Component Bundle"}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <p className="text-[10px] text-center text-on-surface-variant/40 uppercase tracking-widest font-bold">
          Free Insured Delivery on All Builds
        </p>
      </div>
    </div>
  );
};
