'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Plus } from 'lucide-react';
import { PCComponent } from '@/lib/builder-data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency } from '@/utils/pricing';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ComponentCardProps {
  component: PCComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(component.id)}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all cursor-pointer",
        isSelected 
          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
          : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
      )}
    >
      {/* Brand & Price Tag */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
          {component.brand}
        </span>
        <span className="text-sm font-bold text-cyan-400 font-mono">
          {formatCurrency(component.price)}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full mb-4 group-hover:scale-105 transition-transform duration-500">
        <Image
          src={component.imageUrl}
          alt={component.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Name */}
      <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 min-h-[2.5rem]">
        {component.name}
      </h3>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {component.specifications.map((spec, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[8px] text-white/40 uppercase font-bold">{spec.label}</span>
            <span className="text-[10px] text-white/80 font-medium truncate">{spec.value}</span>
          </div>
        ))}
      </div>

      {/* Select Button */}
      <button className={cn(
        "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
        isSelected 
          ? "bg-cyan-500 text-black" 
          : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
      )}>
        {isSelected ? (
          <>
            <Check size={14} />
            SELECTED
          </>
        ) : (
          <>
            <Plus size={14} />
            ADD TO BUILD
          </>
        )}
      </button>
    </div>
  );
};
