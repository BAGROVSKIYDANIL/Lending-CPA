import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { API_CONFIG } from './api.config';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly locale = inject(LOCALE_ID);

  /** Endpoint contract: {baseUrl}/{locale}/{relativePath}. No request is sent here. */
  endpoint(path: string): string {
    const baseUrl = this.config.baseUrl;
    if (!baseUrl) {
      throw new Error('API is disabled: configure API_CONFIG.baseUrl before making requests.');
    }
    const segments = path.split('/');
    if (
      !path ||
      segments.some((segment) => !segment || segment === '.' || segment === '..') ||
      /[\\?#:]/.test(path)
    ) {
      throw new Error('API path must be a relative path without query parameters or traversal.');
    }
    const locale = this.config.localeMap[this.locale] ?? this.locale;
    if (!locale) {
      throw new Error('API locale must not be empty.');
    }
    return `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(locale)}/${segments.map(encodeURIComponent).join('/')}`;
  }

  get<T>(path: string, params?: HttpParams) {
    return this.http.get<T>(this.endpoint(path), { params });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.endpoint(path), body);
  }
}
