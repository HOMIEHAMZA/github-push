import React from "react";

export default function ReturnsExchanges() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface">
        Returns & <span className="text-primary">Exchanges</span>
      </h1>
      
      <div className="space-y-8 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">30-Day Guarantee</h2>
          <p>
            We stand behind every piece of gear we curate. If you are not completely satisfied with your purchase, you may return it within 30 days of delivery for a full refund or exchange.
          </p>
        </section>

        <section className="bg-surface-container border border-surface-container-highest rounded-2xl p-8">
          <h2 className="text-xl font-display font-semibold text-on-surface mb-4">Eligibility Requirements</h2>
          <ul className="list-disc pl-6 space-y-3 font-sans">
            <li>Items must be in original, unopened packaging.</li>
            <li>All accessories, manuals, and documentation must be included.</li>
            <li>Software and digital downloads are non-refundable once activated.</li>
            <li>Custom PC builds may be subject to a 15% restocking fee.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">The Return Process</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
              <p>Initiate your return via the <strong>Order Status</strong> page in your account dashboard.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
              <p>Print the prepaid shipping label provided by our system.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
              <p>Pack your gear securely and drop it off at any authorized courier location.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">Warranty Claims</h2>
          <p>
            If your gear develops a fault after the 30-day return window, please refer to the manufacturer's warranty. For custom PCs, please contact our technical support directly for warranty service.
          </p>
        </section>

        <section className="pt-8 border-t border-surface-container text-center">
          <h3 className="text-xl font-display font-bold text-on-surface mb-4">Need assistance with a return?</h3>
          <a 
            href="/support/contact" 
            className="text-primary font-display font-bold tracking-widest hover:underline"
          >
            TALK TO A SPECIALIST
          </a>
        </section>
      </div>
    </div>
  );
}
