import React from "react";

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship to the United States, Canada, and select European countries. Check our shipping calculator at checkout for more details."
  },
  {
    question: "What is the warranty on custom PCs?",
    answer: "All custom PCs built through the PC Builder come with a 2-year limited warranty covering parts and labor."
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can be canceled within 12 hours of placement. Once an order has entered the processing stage, it may no longer be eligible for cancellation."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Stripe. Installment payments are also available for select high-tier gear."
  }
];

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface">
        Frequently Asked <span className="text-primary">Questions</span>
      </h1>
      
      <div className="space-y-6">
        {FAQ_ITEMS.map((item, index) => (
          <div 
            key={index} 
            className="p-6 rounded-2xl bg-surface-container border border-surface-container-highest hover:border-primary/30 transition-all group"
          >
            <h3 className="text-lg font-display font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors">
              {item.question}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
        <h2 className="text-2xl font-display font-bold text-on-surface mb-4">Still have questions?</h2>
        <p className="text-on-surface-variant mb-6">Our support team is ready to assist you with any inquiries.</p>
        <a 
          href="/support/contact" 
          className="inline-block bg-primary text-on-primary font-bold px-8 py-3 rounded-xl tracking-widest hover:brightness-110 transition-all font-display"
        >
          CONTACT SUPPORT
        </a>
      </div>
    </div>
  );
}
