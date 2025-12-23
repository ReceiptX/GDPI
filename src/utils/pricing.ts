// Pricing utility for per-homeowner subscription model

export const PRICING_CONFIG = {
  STANDARD_PRICE_PER_HOMEOWNER: 3.00,
  BULK_PRICE_PER_HOMEOWNER: 1.50,
  BULK_DISCOUNT_THRESHOLD: 50, // Bulk pricing kicks in at 50+ homeowners
};

/**
 * Calculate monthly subscription pricing based on homeowner count
 * 
 * Pricing model:
 * - $3.00 per homeowner per month (standard rate)
 * - $1.50 per homeowner per month (bulk rate for 50+ homeowners)
 * 
 * @param homeownerCount Number of homeowners in the HOA
 * @returns Pricing information including total, per-homeowner rate, and bulk discount status
 */
export function calculatePricing(homeownerCount: number): {
  homeownerCount: number;
  pricePerHomeowner: number;
  monthlyTotal: number;
  hasBulkDiscount: boolean;
  discountThreshold: number;
} {
  const hasBulkDiscount = homeownerCount >= PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD;
  const pricePerHomeowner = hasBulkDiscount 
    ? PRICING_CONFIG.BULK_PRICE_PER_HOMEOWNER 
    : PRICING_CONFIG.STANDARD_PRICE_PER_HOMEOWNER;
  
  const monthlyTotal = homeownerCount * pricePerHomeowner;

  return {
    homeownerCount,
    pricePerHomeowner,
    monthlyTotal,
    hasBulkDiscount,
    discountThreshold: PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD,
  };
}

/**
 * Format pricing for display
 */
export function formatPricing(pricing: ReturnType<typeof calculatePricing>): string {
  const { homeownerCount, pricePerHomeowner, monthlyTotal, hasBulkDiscount } = pricing;
  
  const perHomeownerText = `$${pricePerHomeowner.toFixed(2)}/homeowner`;
  const totalText = `$${monthlyTotal.toFixed(2)}/month`;
  const discountBadge = hasBulkDiscount ? ' 🎉 Bulk Discount Applied!' : '';
  
  return `${homeownerCount} homeowners × ${perHomeownerText} = ${totalText}${discountBadge}`;
}

/**
 * Calculate savings with bulk discount
 */
export function calculateSavings(homeownerCount: number): number | null {
  if (homeownerCount < PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD) {
    return null; // No savings if below threshold
  }
  
  const standardTotal = homeownerCount * PRICING_CONFIG.STANDARD_PRICE_PER_HOMEOWNER;
  const bulkTotal = homeownerCount * PRICING_CONFIG.BULK_PRICE_PER_HOMEOWNER;
  
  return standardTotal - bulkTotal;
}
