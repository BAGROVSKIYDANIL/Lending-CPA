import {Component, effect, ElementRef, inject, viewChild} from '@angular/core';
import { Navigation } from '@shared/ui/navigation/navigation';
import {Socials} from "@shared/ui/socials/socials";
import {Languages} from "@shared/ui/languages/languages";
import {ViewportService} from "@shared/services/viewport.service";

@Component({
  selector: 'app-mobile-menu',
  imports: [Navigation, Socials, Languages],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu {
  readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  readonly viewport = inject(ViewportService);

  constructor() {
    effect(() => {
      if (!this.viewport.isMobile()) {
        this.close();
      }
    });
  }

  open(): void {
    this.menu().nativeElement.showModal();
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.menu().nativeElement.close();
    document.body.style.overflow = '';
  }
}