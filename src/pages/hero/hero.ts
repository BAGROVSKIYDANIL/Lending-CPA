import {Component, inject, signal} from '@angular/core';
import {Header} from "@widgets/header/header";
import {Socials} from "@shared/ui/socials/socials";
import {ViewportService} from "@shared/services/viewport.service"
import {TranslatePipe } from '@ngx-translate/core';
import { Preloader } from '@shared/ui/preloader';
@Component({
    imports: [
        Header,
        Socials,
        TranslatePipe,
        Preloader
    ],
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
