import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret || clientId === '...' || clientSecret === '...') {
  console.warn('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing or using placeholder. PayPal integration will not work.');
}

// Configure environment
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(clientId || '', clientSecret || '')
  : new paypal.core.SandboxEnvironment(clientId || '', clientSecret || '');

// Create client
export const paypalClient = new paypal.core.PayPalHttpClient(environment);
