import { Injectable, inject, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import {DEFAULT_LANGUAGE, isLanguage, Language,} from './language.types';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly translate = inject(TranslateService);

    readonly language = computed<Language>(() => {
        const current = this.translate.currentLang();

        return current && isLanguage(current)
            ? current
            : DEFAULT_LANGUAGE;
    });

    getInitialLanguage(): Language {
        const saved = localStorage.getItem('language');

        return saved && isLanguage(saved)
            ? saved
            : DEFAULT_LANGUAGE;
    }

    async changeLanguage(lang: Language): Promise<void> {
        if (this.language() === lang) return;

        await firstValueFrom(this.translate.use(lang));

        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    }
}