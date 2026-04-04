'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Plus } from 'lucide-react';
import { ApiProduct } from '@/lib/api-types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ComponentCardProps {
  component: ApiProduct;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, isSelected, onSelect }) => {
  const primaryImage = component.images?.find(img => img.isPrimary)?.url || component.images?.[0]?.url || '/images/placeholder.png';
  const displayPrice = component.basePrice || 0;
  const brand = component.brand || 'Premium';

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
          {typeof brand === 'string' ? brand : brand?.name || 'Premium'}
        </span>
        <span className="text-sm font-bold text-cyan-400 font-mono">
          ${Number(displayPrice).toFixed(2)}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full mb-4 group-hover:scale-105 transition-transform duration-500">
        <Image
          src={primaryImage}
          alt={component.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Name */}
      <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 min-h-10 tracking-tight uppercase">
        {component.name}
      </h3>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {component.specs?.slice(0, 4).map((spec, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[8px] text-white/40 uppercase font-bold truncate">{spec.specKey}</span>
            <span className="text-[10px] text-white/80 font-medium truncate">{spec.specValue}</span>
          </div>
        ))}
      </div>

      {/* Select Button */}
      <button className={cn(
        "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
        isSelected 
          ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
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
