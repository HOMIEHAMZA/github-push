import React from 'react';
import Image from 'next/image';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';

interface HeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  secondaryCtaText: string;
  secondaryCtaHref?: string;
  imageUrl: string;
  badge?: string;
}

export function Hero({ 
  title, 
  subtitle, 
  description, 
  ctaText, 
  ctaHref = '/products',
  secondaryCtaText, 
  secondaryCtaHref = '/products',
  imageUrl, 
  badge 
}: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-tertiary/10 blur-[100px] rounded-full" />
      
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="max-w-2xl">
          {badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-highest border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              {badge}
            </span>
          )}
          
          <h2 className="text-tertiary font-display text-xl uppercase tracking-[0.2em] mb-4">
            {subtitle}
          </h2>
          
          <h1 className="text-6xl md:text-8xl font-display text-on-surface leading-[0.95] mb-8 tracking-tighter">
            {title}
          </h1>
          
          <p className="text-on-surface-variant font-sans text-lg mb-12 max-w-lg leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-6">
            <PrimaryButton href={ctaHref}>{ctaText}</PrimaryButton>
            <SecondaryButton href={secondaryCtaHref}>{secondaryCtaText}</SecondaryButton>
          </div>
        </div>
        
        <div className="relative h-[500px] lg:h-[700px] flex items-center justify-center">
          {/* Animated Glow behind image */}
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent blur-3xl opacity-50 animate-pulse" />
          
          <div className="relative w-full h-full lg:scale-110 transform lg:translate-x-12 filter drop-shadow-[0_0_50px_rgba(143,245,255,0.2)]">
            <Image
              src={imageUrl}
              alt="Hero Showcase"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
