import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { LanguageService, isLanguage } from '@shared/i18n';

export const languageResolver: ResolveFn<boolean> = async (route) => {
    const languageService = inject(LanguageService);

    const lang = route.paramMap.get('lang');

    if (!lang || !isLanguage(lang)) {
        return false;
    }

    await languageService.changeLanguage(lang);

    return true;
};