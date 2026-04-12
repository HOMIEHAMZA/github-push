'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Large Image Container */}
      <div 
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container-low group shadow-2xl cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        <Image
          src={images[activeImage]}
          alt={productName}
          fill
          priority
          className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Subtle Glow Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,245,255,0.05),transparent_70%)] pointer-events-none" />

        {/* Hover Action Indicator */}
        <div className="absolute bottom-6 right-6 p-3 rounded-full bg-surface-container-highest/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-primary/20">
          <Maximize2 size={18} />
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveImage(idx);
            }}
            className={`
              relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300
              ${activeImage === idx 
                ? 'border-primary shadow-[0_0_15px_rgba(143,245,255,0.3)]' 
                : 'border-transparent bg-surface-container hover:border-surface-container-highest/40'}
            `}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-contain p-2"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* High-Resolution Modal / Lightbox */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-fade-in backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-8 right-8 p-3 bg-surface-container rounded-full text-on-surface hover:text-primary transition-colors border border-surface-container-highest/30 shadow-2xl"
            onClick={() => setIsZoomed(false)}
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-[90vh] flex items-center justify-center animate-scale-in">
            <Image
              src={images[activeImage]}
              alt={productName}
              fill
              className="object-contain"
              sizes="90vw"
              quality={100}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
