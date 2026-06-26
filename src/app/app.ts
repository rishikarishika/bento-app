import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PricingComponent } from './features/pricing/pricing.component';
import { BentoComponent }  from './features/bento/bento.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PricingComponent, BentoComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
