import { SubscriptionPlan, SubscriptionRecord } from '../types';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const EARLY_ACCESS_PLAN: SubscriptionPlan = {
  id: 'early-access-v1',
  label: 'Early Access Lock',
  price: 1.99,
  currency: 'USD',
  billingInterval: 'monthly',
  lockDurationYears: 5,
  includesFutureServices: true,
  description: 'Founding HOAs lock $1.99/mo pricing for five years. Every future GDPI service is included at that rate.',
  perks: [
    'Unlimited AI quote reviews',
    'Neighborhood pricing visibility',
    'Admin & resident management',
    'Future GDPI service launches included',
  ],
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const rounded = amount.toFixed(2);
  switch (currency) {
    case 'USD':
    default:
      return `$${rounded}`;
  }
};

export const formatBillingInterval = (interval: SubscriptionPlan['billingInterval'] | SubscriptionRecord['billingInterval']): string => {
  return interval === 'annual' ? 'year' : 'month';
};

export const buildSubscriptionRecord = (hoaId: string, startDate: Date = new Date()): SubscriptionRecord => {
  const lockStart = startDate.toISOString();
  const lockExpiresDate = new Date(startDate);
  lockExpiresDate.setFullYear(lockExpiresDate.getFullYear() + EARLY_ACCESS_PLAN.lockDurationYears);

  return {
    hoaId,
    planId: EARLY_ACCESS_PLAN.id,
    lockedPrice: EARLY_ACCESS_PLAN.price,
    currency: EARLY_ACCESS_PLAN.currency,
    billingInterval: EARLY_ACCESS_PLAN.billingInterval,
    lockStart,
    lockExpires: lockExpiresDate.toISOString(),
    includesFutureServices: EARLY_ACCESS_PLAN.includesFutureServices,
  };
};

export const formatLockExpiration = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  const month = monthNames[parsed.getMonth()] ?? '';
  return `${month} ${parsed.getDate()}, ${parsed.getFullYear()}`.trim();
};

export const buildPlanSummary = (record: SubscriptionRecord): string => {
  const price = formatCurrency(record.lockedPrice, record.currency);
  const interval = formatBillingInterval(record.billingInterval);
  const expires = formatLockExpiration(record.lockExpires);
  const futureServices = record.includesFutureServices ? 'Includes every future GDPI service.' : '';
  return `${price}/${interval === 'month' ? 'mo' : interval} locked until ${expires}. ${futureServices}`.trim();
};
