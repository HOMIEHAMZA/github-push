import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is missing. Ensure you add it to your .env file.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  appInfo: {
    name: 'Accessomart API',
    version: '1.0.0',
  },
});
