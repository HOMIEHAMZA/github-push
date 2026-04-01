'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Star } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Button';

interface FilterSidebarProps {
  categories: string[];
  brands: string[];
  selectedCategory: string;
  selectedBrands: string[];
  priceRange: [number, number];
  selectedRating: number | null;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onRatingChange: (rating: number | null) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRating,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onRatingChange,
  onClearAll,
  isOpen,
  onClose
}: FilterSidebarProps) {
  
  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8 border-b border-surface-container-highest/10 pb-8 last:border-0 last:mb-0 last:pb-0">
      <h3 className="font-display text-sm tracking-[0.2em] uppercase text-on-surface mb-6">{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-full sm:w-80 bg-surface z-[70] p-8 
        transition-transform duration-500 ease-out
        lg:translate-x-0 lg:static lg:block lg:p-0 lg:z-0 lg:bg-transparent lg:w-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full lg:sticky lg:top-32">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <h2 className="font-display text-xl uppercase tracking-widest text-on-surface">Filters</h2>
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow h-full pr-4 -mr-4 lg:overflow-visible">
            {/* Categories */}
            <FilterSection title="Category">
              <div className="space-y-3">
                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`
                      flex items-center w-full text-left font-sans text-sm tracking-wide transition-all
                      ${selectedCategory === cat ? 'text-primary font-bold ml-2' : 'text-on-surface-variant hover:text-on-surface'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection title="Brand">
              <div className="space-y-3">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => onBrandChange(brand)}
                        className="peer appearance-none w-4 h-4 rounded border border-surface-container-highest bg-surface-container transition-all checked:bg-primary checked:border-primary"
                      />
                      <svg
                        className="absolute w-2.5 h-2.5 text-surface pointer-events-none hidden peer-checked:block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Limit">
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => onPriceChange(0, parseInt(e.target.value))}
                  className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                  <span>$0</span>
                  <span className="text-primary font-bold">${priceRange[1]}</span>
                  <span>$2k+</span>
                </div>
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Min Rating">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRatingChange(selectedRating === star ? null : star)}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-all border
                      ${selectedRating && selectedRating >= star 
                        ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(143,245,255,0.2)]' 
                        : 'bg-surface-container border-surface-container-highest/20 text-on-surface-variant hover:border-primary/20'}
                    `}
                  >
                    <Star size={14} fill={selectedRating && selectedRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </FilterSection>

            <button 
              onClick={onClearAll}
              className="w-full py-4 text-xs font-display tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Mobile Footer */}
          <div className="mt-8 lg:hidden">
            <PrimaryButton className="w-full" onClick={onClose}>
              View Results
            </PrimaryButton>
          </div>
        </div>
      </aside>
    </>
  );
}
