import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { API_CONFIG } from '@shared/api';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: __APP_LOCALE__ },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    { provide: API_CONFIG, useValue: { baseUrl: null, localeMap: {} } },
  ]
};
