import {
  Component, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import {
  PRICING_MATRIX, PricingTier, Currency, BillingCycle,
  computePrice, formatPrice
} from './pricing.config';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {
  readonly matrix = PRICING_MATRIX;
  readonly currencies: Currency[] = ['USD', 'EUR', 'INR'];
  readonly cycles: BillingCycle[] = ['monthly', 'annual'];

  cycle   = signal<BillingCycle>('monthly');
  currency = signal<Currency>('USD');

  // Annual saving label per tier — memoised
  annualSavings = computed(() =>
    this.matrix.tiers.map(t => {
      const monthly = computePrice(t.baseMonthlyUSD, 'monthly', this.currency(), this.matrix);
      const annual  = computePrice(t.baseMonthlyUSD, 'annual',  this.currency(), this.matrix);
      const saved   = (monthly - annual) * 12;
      return formatPrice(saved, this.currency(), this.matrix);
    })
  );

  price(tier: PricingTier): string {
    const raw = computePrice(tier.baseMonthlyUSD, this.cycle(), this.currency(), this.matrix);
    return formatPrice(raw, this.currency(), this.matrix);
  }

  billedLabel(): string {
    if (this.cycle() === 'annual') return '/ mo, billed annually';
    return '/ month';
  }

  setCycle(c: BillingCycle)   { this.cycle.set(c); }
  setCurrency(c: Currency)    { this.currency.set(c); }
}
