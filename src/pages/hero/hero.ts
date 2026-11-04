import { Component, inject, signal } from '@angular/core';
import { Header } from '@widgets/header/header';
import { Socials } from '@shared/ui/socials/socials';
import { Preloader } from '@shared/ui/preloader';
import { ViewportService } from '@shared/services/viewport.service';

@Component({
  imports: [Header, Socials, Preloader],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
  readonly viewport = inject(ViewportService);
  readonly isPreloading = signal(true);

  completePreloading(): void {
    this.isPreloading.set(false);
  }
}
