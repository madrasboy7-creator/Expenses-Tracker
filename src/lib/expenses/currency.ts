/**
 * Currency utility for Indian Rupee (INR ₹) formatting
 * Following the prompt requirement: format amounts using Indian locale and INR, for example ₹1,25,000.00
 */

export function formatINR(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount ?? 0);
  
  if (isNaN(numericAmount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Format INR without currency symbol for compact chart axis or input display
 */
export function formatINRAmountOnly(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount ?? 0);
  
  if (isNaN(numericAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
