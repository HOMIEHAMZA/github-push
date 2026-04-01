import React from 'react';
import { ProductCatalog } from '@/components/sections/ProductCatalog';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { Footer } from '@/components/ui/Footer';

export const metadata = {
  title: 'Catalog | Accessomart',
  description: 'Explore the full collection of high-performance gaming and professional electronics at Accessomart. Redefine your digital frontier.',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <GlassNavbar />
      <main className="flex-grow">
        <ProductCatalog />
      </main>
      <Footer />
    </div>
  );
}
