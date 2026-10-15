import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api.config';

export type ApiLanguage = 'en' | 'ru' | 'ua';

export interface ApiRequestOptions {
  readonly locale?: string;
  readonly params?: HttpParams;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly locale = inject(LOCALE_ID);
  private readonly headers = new HttpHeaders(this.config.headers);

  /** Endpoint contract: {baseUrl}/{locale}/{relativePath}. */
  endpoint(path: string, locale = this.locale): string {
    const segments = path.split('/');
    if (
      !path ||
      segments.some((segment) => !segment || segment === '.' || segment === '..') ||
      /[\\?#:]/.test(path)
    ) {
      throw new Error('API path must be a relative path without query parameters or traversal.');
    }
    const endpointLocale = this.config.localeMap[locale] ?? locale;
    if (!endpointLocale) {
      throw new Error('API locale must not be empty.');
    }
    return `${this.config.baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(endpointLocale)}/${segments.map(encodeURIComponent).join('/')}`;
  }

  get<TResponse>(path: string, options: ApiRequestOptions = {}): Observable<TResponse> {
    return this.http.get<TResponse>(this.endpoint(path, options.locale), {
      headers: this.headers,
      params: options.params,
    });
  }

  post<TResponse, TRequest>(
    path: string,
    body: TRequest,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.endpoint(path, options.locale), body, {
      headers: this.headers,
      params: options.params,
    });
  }
}
