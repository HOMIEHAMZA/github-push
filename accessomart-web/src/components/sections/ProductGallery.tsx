'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Large Image Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container-low group shadow-2xl">
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
      </div>

      {/* Thumbnails Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
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
    </div>
  );
}
