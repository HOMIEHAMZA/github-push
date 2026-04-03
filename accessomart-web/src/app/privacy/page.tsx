import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-on-surface">
        Privacy <span className="text-primary">Policy</span>
      </h1>
      
      <div className="space-y-8 text-on-surface-variant leading-relaxed">
        <p className="text-lg">
          Your privacy is critically important to us. At Accessomart, we have a few fundamental principles:
        </p>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">2. Use of Information</h2>
          <p>
            We use the information we collect in various ways, including to:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you for customer service and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">3. Data Retention</h2>
          <p>
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">4. Third-Party Sharing</h2>
          <p>
            We don’t share any personally identifying information publicly or with third-parties, except when required to by law or to fulfill service requirements (such as payment processing via Stripe or PayPal).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-on-surface mb-4">5. Your Rights</h2>
          <p>
            You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.
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
