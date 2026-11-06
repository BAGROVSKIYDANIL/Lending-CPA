import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-benefits-marquee',
  standalone: true,
  templateUrl: './benefits-marquee.html',
  styleUrl: './benefits-marquee.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsMarquee {}
