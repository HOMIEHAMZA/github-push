import React from 'react';
import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/Button';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  reverse?: boolean;
}

export function PromoBanner({ title, subtitle, description, ctaText, imageUrl, reverse = false }: PromoBannerProps) {
  return (
    <section className="py-24 bg-surface px-6">
      <div className={`container mx-auto rounded-3xl overflow-hidden bg-surface-container-highest relative ${reverse ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] items-center">
          
          <div className={`p-10 lg:p-24 relative z-10 ${reverse ? 'lg:order-2' : ''}`}>
            <h3 className="text-tertiary font-display text-sm uppercase tracking-[0.2em] mb-6">
              {subtitle}
            </h3>
            <h2 className="text-5xl lg:text-7xl font-display text-on-surface mb-8 leading-tight">
              {title}
            </h2>
            <p className="text-on-surface-variant font-sans text-lg mb-12 max-w-md leading-relaxed">
              {description}
            </p>
            <PrimaryButton>{ctaText}</PrimaryButton>
          </div>
          
          <div className={`relative h-full min-h-[400px] overflow-hidden ${reverse ? 'lg:order-1' : ''}`}>
            {/* Background Glow behind the image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl" />
            
            <Image
              src={imageUrl}
              alt="Promotion"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Masking gradient to blend with the text area on small screens */}
            <div className={`absolute inset-0 block lg:hidden bg-gradient-to-t from-surface-container-highest via-transparent to-transparent`} />
          </div>

        </div>
        
        {/* Absolute Subtle Logo or Graphic */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
