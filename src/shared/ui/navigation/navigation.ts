import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ViewportService } from '@shared/services/viewport.service';
import { LanguageService } from '@shared/i18n';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [RouterLink, TranslatePipe],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation {
  readonly viewport = inject(ViewportService);
  readonly languageService = inject(LanguageService);
  readonly navRoutes = [
    { label: 'team', fragment: 'team' },
    { label: 'benefits', fragment: 'benefits' },
    { label: 'join-us', fragment: 'join' },
  ];
}
