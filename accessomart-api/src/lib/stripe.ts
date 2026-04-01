import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is missing. Ensure you add it to your .env file.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia', // using latest explicitly versioned type
  appInfo: {
    name: 'Accessomart API',
    version: '1.0.0',
  },
});
