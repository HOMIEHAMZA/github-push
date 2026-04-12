export const PRICING_CONFIG = {
  currency: 'AED',
  currencySymbol: 'AED',
  shippingThreshhold: 500,
  shippingCost: 0,
  taxRate: 0,
};

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ${PRICING_CONFIG.currencySymbol}`;
}
