import {Component, signal, viewChild} from '@angular/core';
import {MobileMenu} from "@widgets/mobile-menu/mobile-menu";
import {Navigation} from "@shared/ui/navigation/navigation";
import {Languages} from "@shared/ui/languages/languages";

@Component({
  imports: [
    MobileMenu,
    Navigation,
    Languages,
  ],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {

  readonly mobileMenu = viewChild.required(MobileMenu);

  open(): void {
    this.mobileMenu().open();
  }

}
