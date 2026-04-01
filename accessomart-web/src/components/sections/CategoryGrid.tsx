import React from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  count: string;
  imageUrl: string;
  color?: string;
}

interface CategoryGridProps {
  title: string;
  subtitle: string;
  categories: Category[];
}

export function CategoryGrid({ title, subtitle, categories }: CategoryGridProps) {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h3 className="text-tertiary font-display text-sm uppercase tracking-[0.2em] mb-4">
              {subtitle}
            </h3>
            <h2 className="text-4xl md:text-5xl font-display text-on-surface">
              {title}
            </h2>
          </div>
          <button className="text-primary font-semibold uppercase tracking-wider text-sm hover:underline underline-offset-8">
            View All Collections
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="group relative h-80 overflow-hidden rounded-xl bg-surface-container flex flex-col justify-end transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 transition-opacity duration-500 group-hover:opacity-40`} 
                style={{ backgroundColor: category.color || '#8ff5ff' }}
              />
              
              {/* Image with Parallax-like effect */}
              <div className="absolute inset-x-0 -top-10 bottom-20 transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-contain p-6 drop-shadow-2xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 pt-0 mt-auto bg-gradient-to-t from-surface-container via-surface-container/90 to-transparent">
                <h4 className="text-2xl font-display text-on-surface mb-1">{category.name}</h4>
                <p className="text-on-surface-variant font-sans text-sm uppercase tracking-widest">{category.count} Products</p>
              </div>
              
              {/* Overlay Link Effect */}
              <div className="absolute inset-0 border border-white/5 rounded-xl group-hover:border-primary/30 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
