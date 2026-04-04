'use client';

import React from 'react';
import { usePCBuilderStore } from '@/store/usePCBuilderStore';
import { Check, Circle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PCBuilderNav: React.FC = () => {
  const { categories, activeCategory, setActiveCategory, selections } = usePCBuilderStore();

  return (
    <nav className="flex flex-col gap-2 p-6 bg-white/5 border border-white/5 rounded-3xl h-fit sticky top-40">
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        MISSION PHASES
      </h2>
      
      {categories.map((category) => {
        const isSelected = !!selections[category.name];
        const isActive = activeCategory === category.name;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left group",
              isActive 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
              isSelected 
                ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                : isActive ? "border-cyan-500/50" : "border-white/10 group-hover:border-white/20"
            )}>
              {isSelected ? <Check size={12} /> : <Circle size={8} className="fill-current opacity-20" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{category.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
