import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { API_CONFIG } from '@shared/api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: __APP_LOCALE__ },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    { provide: API_CONFIG, useValue: { baseUrl: null, localeMap: {} } },
  ],
};
