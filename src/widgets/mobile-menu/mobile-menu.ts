import {Component, ElementRef, input, output, viewChild} from '@angular/core';
import { Navigation } from '@shared/ui/navigation/navigation';
import {Socials} from "@shared/ui/socials/socials";
import {Languages} from "@shared/ui/languages/languages";

@Component({
  selector: 'app-mobile-menu',
  imports: [Navigation, Socials, Languages],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu {
  readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  open(): void {
    this.menu().nativeElement.showModal();
  }

  close(): void {
    this.menu().nativeElement.close();
  }
}