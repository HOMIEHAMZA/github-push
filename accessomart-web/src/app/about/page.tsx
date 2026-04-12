import React from 'react';
import { ShieldCheck, Truck, Headset, Zap, Cpu, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="grow flex flex-col pt-12">
      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-12 overflow-hidden border-b border-surface-container">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,245,255,0.05),transparent_70%)] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto relative">
          <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tighter text-on-surface mb-8">
            The Obsidian <span className="text-primary">Standard.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-2xl leading-relaxed">
            Accessomart is the digital destination for elite curators of technology. We don't just sell components; we provide the building blocks for your digital legacy.
          </p>
        </div>
      </section>

      {/* Curation Philosophy */}
      <section className="py-24 px-6 lg:px-12 bg-surface-container-lowest/50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-on-surface mb-6 uppercase tracking-widest">
              Elite Curation
            </h2>
            <div className="space-y-6 text-on-surface-variant font-sans leading-relaxed text-lg">
              <p>
                In an era of mass-market electronics, Accessomart stands apart as a specialized curator. Every item in our catalog—from high-performance cooling systems to legendary-tier peripherals—undergoes the "Obsidian Audit."
              </p>
              <p>
                We vet for thermal efficiency, build integrity, and raw computational potential. If a component doesn't meet the standard of the elite curator, it doesn't enter our circuit.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-8 rounded-2xl border border-surface-container-highest/20 hover:border-primary/20 transition-all group">
              <Cpu className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-display font-bold text-on-surface mb-2 uppercase text-xs tracking-widest">Performance</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">Benchmarked for maximum output and stability.</p>
            </div>
            <div className="bg-surface-container p-8 rounded-2xl border border-surface-container-highest/20 hover:border-primary/20 transition-all group">
              <Settings2 className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-display font-bold text-on-surface mb-2 uppercase text-xs tracking-widest">Integrity</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">Built from premium materials for long-term endurance.</p>
            </div>
            <div className="bg-surface-container p-8 rounded-2xl border border-surface-container-highest/20 hover:border-primary/20 transition-all group">
              <Zap className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-display font-bold text-on-surface mb-2 uppercase text-xs tracking-widest">Innovation</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">Cutting-edge tech from verified legacy brands.</p>
            </div>
            <div className="bg-surface-container p-8 rounded-2xl border border-surface-container-highest/20 mt-8 group">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary font-display font-bold italic text-xl">A</div>
              <h3 className="mt-4 font-display font-bold text-on-surface mb-2 uppercase text-xs tracking-widest">ACCESSOMART</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">The Obsidian standard of excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Reliability Section */}
      <section className="py-24 px-6 lg:px-12 border-y border-surface-container">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4">Foundation of Trust</h2>
            <h3 className="text-4xl font-display font-bold text-on-surface">Secure. Reliable. Direct.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-8 bg-surface-container/30 rounded-3xl border border-surface-container-highest/10 transition-all hover:bg-surface-container/50">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-6">
                <ShieldCheck size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-on-surface mb-4">Payment Protection</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                All transactions are encrypted and secured via Stripe and PayPal. Your financial data never touches our internal servers—ensuring absolute privacy and safety.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-surface-container/30 rounded-3xl border border-surface-container-highest/10 transition-all hover:bg-surface-container/50">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-6">
                <Truck size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-on-surface mb-4">Precision Logistics</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                We handle every component with care. From the factory to your door, our logistics network is optimized for the safe delivery of sensitive electronics and gaming gear.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-surface-container/30 rounded-3xl border border-surface-container-highest/10 transition-all hover:bg-surface-container/50">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-6">
                <Headset size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-on-surface mb-4">Dedicated Support</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Accessomart products come with a service guarantee. Our technical support team is standing by to assist with warranties, exchanges, and setup optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-surface-container-highest/20 border border-primary/10 backdrop-blur-md">
          <h2 className="text-3xl font-display font-bold text-on-surface mb-6">Ready to upgrade your circuit?</h2>
          <p className="text-on-surface-variant mb-8 font-sans">
            Join thousands of elite tech enthusiasts who trust Accessomart for their legendary gear.
          </p>
          <Link 
            href="/products"
            className="px-10 py-4 bg-primary text-on-primary font-display font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-lg inline-block text-xs"
          >
            Explore the Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
