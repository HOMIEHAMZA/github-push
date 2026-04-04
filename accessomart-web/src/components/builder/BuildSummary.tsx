'use client';

import React from 'react';
import { usePCBuilderStore } from '@/store/usePCBuilderStore';
import { AlertCircle, ArrowRight, Trash2, Zap, LayoutGrid } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BuildSummary: React.FC = () => {
  const { 
    getSelections, 
    getTotalPrice, 
    getCompatibilityWarnings, 
    clearBuild, 
    saveBuild 
  } = usePCBuilderStore();
  
  const router = useRouter();
  const [isDeploying, setIsDeploying] = React.useState(false);

  const selectedComponents = getSelections();
  const totalPrice = getTotalPrice();
  const warnings = getCompatibilityWarnings();

  const handleDeploy = async () => {
    if (selectedComponents.length === 0) return;
    setIsDeploying(true);
    try {
      await saveBuild(`${selectedComponents[0]?.name?.split(' ')[0] || 'My'} Elite Rig`);
      alert("Deployment Successful! Your build has been saved to your hangar.");
      router.push('/account/builds');
    } catch (err) {
      alert("Deployment Interrupt: " + (err instanceof Error ? err.message : "System Error"));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-zinc-900 border border-white/5 rounded-3xl sticky top-40 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
          <LayoutGrid size={20} className="text-cyan-400" />
          Loadout
        </h2>
        <button 
          onClick={clearBuild}
          className="p-2 text-white/40 hover:text-red-400 transition-colors"
          title="Scrap Build"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Selected Components List (Compact) */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {selectedComponents.length > 0 ? (
          selectedComponents.map((c) => (
            <div key={c.id} className="flex justify-between items-center text-xs pb-3 border-b border-white/5 group">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest">
                  {c.category?.name || 'ASSET'}
                </span>
                <span className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                  {c.name}
                </span>
              </div>
              <span className="font-mono text-cyan-400/80 shrink-0">
                ${Number(c.basePrice).toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-white/20 space-y-3">
            <Zap size={32} className="mx-auto opacity-20 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Awaiting Hardware Input</p>
          </div>
        )}
      </div>

      {/* Compatibility Warnings */}
      <div className="space-y-3">
        {warnings.length > 0 ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Conflict Detected</span>
            </div>
            {warnings.map((w, idx) => (
              <p key={idx} className="text-[10px] text-red-400/80 leading-relaxed uppercase">• {w}</p>
            ))}
          </div>
        ) : selectedComponents.length > 0 && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2 text-cyan-400">
            <Zap size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">System Calibrated</span>
          </div>
        )}
      </div>

      {/* Totals & Action */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Est. Build Total</span>
          <span className="text-2xl font-bold text-white font-mono tracking-tighter">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        
        <button
          onClick={handleDeploy}
          disabled={selectedComponents.length === 0 || warnings.length > 0 || isDeploying}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold tracking-[0.2em] uppercase text-xs transition-all group overflow-hidden relative",
            selectedComponents.length > 0 && warnings.length === 0 && !isDeploying
              ? "bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] active:scale-95"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {isDeploying ? (
             <span className="animate-pulse">SYNCHRONIZING...</span>
          ) : (
            <>
              {warnings.length > 0 ? "Resolve Conflict" : "Deploy Component Bundle"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-bold">
          Free Insured Delivery on All Builds
        </p>
      </div>
    </div>
  );
};
