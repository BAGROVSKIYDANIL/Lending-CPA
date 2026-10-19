import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { API_CONFIG } from '@shared/api';
import { environment } from '../environments/environment';

const apiHeaderSeparator = environment.apiHeader.indexOf(':');
if (apiHeaderSeparator === -1) {
  throw new Error('environment.apiHeader must use the "name: value" format.');
}

const apiHeaderName = environment.apiHeader.slice(0, apiHeaderSeparator).trim();
const apiHeaderValue = environment.apiHeader.slice(apiHeaderSeparator + 1).trim();
if (!apiHeaderName || !apiHeaderValue) {
  throw new Error('environment.apiHeader must contain a header name and value.');
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: __APP_LOCALE__ },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    {
      provide: API_CONFIG,
      useValue: {
        baseUrl: environment.apiUrl,
        headers: { [apiHeaderName]: apiHeaderValue },
        localeMap: { 'en-US': 'en' },
      },
    },
  ],
};
