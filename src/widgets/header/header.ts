import {Component, viewChild} from '@angular/core';
import {MobileMenu} from "@widgets/mobile-menu/mobile-menu";
import {Navigation} from "@shared/ui/navigation/navigation";
import {Languages} from "@shared/ui/languages/languages";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    imports: [
        MobileMenu,
        Navigation,
        Languages,
        TranslatePipe,
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
