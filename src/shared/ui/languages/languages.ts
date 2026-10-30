import {Component, inject, viewChild} from '@angular/core';
import {RouterLink} from "@angular/router";
import {MobileMenu} from "@widgets/mobile-menu/mobile-menu";
import {LanguageService} from "@shared/i18n";

@Component({
  imports: [
    RouterLink
  ],
  selector: 'app-languages',
  styleUrl: './languages.scss',
  templateUrl: './languages.html',
})
export class Languages {
    readonly languageService = inject(LanguageService);
}
