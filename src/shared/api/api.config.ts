import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  /** Null keeps API requests disabled until an actual API is configured. */
  readonly baseUrl: string | null;
  /** Map Angular locale IDs to endpoint locale segments when needed. */
  readonly localeMap: Readonly<Record<string, string>>;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
