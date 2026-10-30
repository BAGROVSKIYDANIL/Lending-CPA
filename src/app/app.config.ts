import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    LOCALE_ID,
    provideBrowserGlobalErrorListeners,
    provideAppInitializer,
    inject
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { API_CONFIG } from '@shared/api';
import { routes } from './app.routes';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from '@shared/i18n';
import { firstValueFrom } from 'rxjs';
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
    provideRouter(routes),
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
      provideTranslateService({
          loader: provideTranslateHttpLoader({
              prefix: '/i18n/',
              suffix: '.json',
          }),
          fallbackLang: 'en',
          lang: 'en',
      }),
      provideAppInitializer(() => {
          const translate = inject(TranslateService);
          const languageService = inject(LanguageService);

          translate.addLangs(['en', 'ru', 'uk']);

          return firstValueFrom(
              translate.use(languageService.getInitialLanguage())
          ).then(() => undefined);
      }),
  ],
};
