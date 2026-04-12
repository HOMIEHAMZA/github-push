export const PRICING_CONFIG = {
  currency: 'AED',
  currencySymbol: 'AED',
  shippingThreshhold: 500,
  shippingCost: 25,
  taxRate: 0.05, // 5% VAT in UAE
};

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ${PRICING_CONFIG.currencySymbol}`;
}
