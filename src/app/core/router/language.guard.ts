import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { isLanguage } from '@shared/i18n';

export const languageGuard: CanActivateFn = (route) => {
    const router = inject(Router);
    const lang = route.paramMap.get('lang');

    if (lang && isLanguage(lang)) {
        return true;
    }

    return router.createUrlTree(['/en/404']);
};