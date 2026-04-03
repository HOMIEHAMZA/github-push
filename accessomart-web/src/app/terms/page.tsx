import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface">
        Terms of <span className="text-primary">Service</span>
      </h1>
      
      <div className="space-y-8 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Accessomart, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">2. Use of License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Accessomart's website for personal, non-commercial transitory viewing only.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">3. Disclaimer</h2>
          <p>
            The materials on Accessomart's website are provided on an 'as is' basis. Accessomart makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">4. Limitations</h2>
          <p>
            In no event shall Accessomart or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Accessomart's website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>

        <section className="pt-8 border-t border-surface-container">
          <p className="text-sm italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </section>
      </div>
    </div>
  );
}
