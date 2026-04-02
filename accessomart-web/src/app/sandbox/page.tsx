import React from 'react';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/ui/ProductCard';
import { SpecSheetGlass } from '@/components/ui/SpecSheetGlass';

export default function SandboxPage() {
  const dummySpecs = [
    { label: 'Latency', value: '1.2ms ultra-low response', active: true },
    { label: 'Switch Type', value: 'Linear Optical Gen-2' },
    { label: 'Polling Rate', value: '8000Hz HyperPolling' },
    { label: 'Battery Life', value: '120 Hours (Wireless Mode)' }
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="grow pt-32 pb-20 px-6 container mx-auto">
        <h1 className="text-5xl font-display text-on-surface mb-12">UI Components Sandbox</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Buttons & Inputs */}
          <section className="space-y-12">
            <div>
              <h2 className="text-tertiary uppercase tracking-widest text-sm font-semibold mb-6">Buttons</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <PrimaryButton>Primary CTA</PrimaryButton>
                <SecondaryButton>Secondary Action</SecondaryButton>
                <TertiaryButton>Tertiary Link</TertiaryButton>
              </div>
            </div>
            
            <div>
              <h2 className="text-tertiary uppercase tracking-widest text-sm font-semibold mb-6">Input Fields</h2>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Enter your email..." />
                <Input placeholder="Password" type="password" />
              </div>
            </div>
          </section>

          {/* Product Card & Spec Sheet */}
          <section className="space-y-12">
            <div>
              <h2 className="text-tertiary uppercase tracking-widest text-sm font-semibold mb-6">Product Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProductCard 
                  id="1"
                  slug="cyberstrike-tkl"
                  name="CyberStrike TKL" 
                  brand="Logitech"
                  category="Gaming Keyboards" 
                  price="$189.00" 
                  imageUrl="/images/keyboard.png" 
                  isFeatured={true}
                />
                <ProductCard 
                  id="2"
                  slug="aeroflow-wireless"
                  name="AeroFlow Wireless" 
                  brand="Corsair"
                  category="Audio & Sound" 
                  price="$249.00" 
                  imageUrl="/images/headset.png" 
                />
              </div>
            </div>

            <div>
              <h2 className="text-tertiary uppercase tracking-widest text-sm font-semibold mb-6">Spec Sheet Glass</h2>
              <SpecSheetGlass 
                title="Technical Specifications" 
                specs={dummySpecs} 
              />
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}
