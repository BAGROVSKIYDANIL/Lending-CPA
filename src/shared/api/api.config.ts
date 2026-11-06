import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  readonly baseUrl: string;
  readonly headers: Readonly<Record<string, string>>;
  /** Map Angular locale IDs to endpoint locale segments when needed. */
  readonly localeMap: Readonly<Record<string, string>>;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
