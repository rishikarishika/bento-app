export type Currency = 'USD' | 'EUR' | 'INR';
export type BillingCycle = 'monthly' | 'annual';

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  baseMonthlyUSD: number;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}

export interface PricingMatrix {
  annualDiscountMultiplier: number;
  regionalTariffs: Record<Currency, number>;
  currencySymbols: Record<Currency, string>;
  currencyLocales: Record<Currency, string>;
  tiers: PricingTier[];
}

export const PRICING_MATRIX: PricingMatrix = {
  // 20% flat annual discount
  annualDiscountMultiplier: 0.80,

  // Regional tariffs applied on top of USD base rate
  regionalTariffs: {
    USD: 1.0,
    EUR: 0.91,
    INR: 84.2,
  },

  currencySymbols: { USD: '$', EUR: '€', INR: '₹' },
  currencyLocales: { USD: 'en-US', EUR: 'de-DE', INR: 'en-IN' },

  tiers: [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Ship your first idea',
      baseMonthlyUSD: 29,
      features: [
        '3 active projects',
        '10 GB storage',
        'REST API access',
        'Email support',
        'Basic analytics',
      ],
      highlighted: false,
      ctaLabel: 'Get started free',
    },
    {
      id: 'blueprint',
      name: 'Blueprint',
      tagline: 'Built for growing teams',
      baseMonthlyUSD: 79,
      features: [
        'Unlimited projects',
        '100 GB storage',
        'GraphQL + REST API',
        'Priority support',
        'Advanced analytics',
        'Custom domains',
        'Team collaboration',
      ],
      highlighted: true,
      ctaLabel: 'Start building',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Scale without limits',
      baseMonthlyUSD: 199,
      features: [
        'Unlimited everything',
        '1 TB storage',
        'All API protocols',
        'Dedicated SLA',
        'Real-time dashboards',
        'SSO & SAML',
        'Audit logs',
        'Custom integrations',
      ],
      highlighted: false,
      ctaLabel: 'Contact sales',
    },
  ],
};

export function computePrice(
  baseMonthlyUSD: number,
  cycle: BillingCycle,
  currency: Currency,
  matrix: PricingMatrix
): number {
  const cycleMultiplier = cycle === 'annual' ? matrix.annualDiscountMultiplier : 1;
  const tariff = matrix.regionalTariffs[currency];
  return baseMonthlyUSD * cycleMultiplier * tariff;
}

export function formatPrice(
  value: number,
  currency: Currency,
  matrix: PricingMatrix
): string {
  const locale = matrix.currencyLocales[currency];
  const fractionDigits = currency === 'INR' ? 0 : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
