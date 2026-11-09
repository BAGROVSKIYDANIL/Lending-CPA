import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MobileMenu } from '@widgets/mobile-menu/mobile-menu';
import { Navigation } from '@shared/ui/navigation/navigation';
import { Languages } from '@shared/ui/languages/languages';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@shared/i18n';

@Component({
  imports: [MobileMenu, Navigation, Languages, TranslatePipe, RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly language = inject(LanguageService).language;

  readonly mobileMenu = viewChild.required(MobileMenu);

  open(): void {
    this.mobileMenu().open();
  }
}
