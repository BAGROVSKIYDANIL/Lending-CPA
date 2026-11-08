import { provideHttpClient, HttpParams } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from './api-client';
import { API_CONFIG } from './api.config';

describe('ApiClient', () => {
  let api: ApiClient;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: LOCALE_ID, useValue: 'en-US' }, { provide: API_CONFIG, useValue: { baseUrl: 'https://example.test/', headers: { 'X-Test': 'value' }, localeMap: { 'en-US': 'en' } } }] });
    api = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('constructs localized and unlocalized encoded endpoints', () => {
    expect(api.endpoint('some path')).toBe('https://example.test/en/some%20path');
    expect(api.endpoint('form', undefined, false)).toBe('https://example.test/form');
    for (const path of ['', '/tasks', 'a/../b', 'a?b']) expect(() => api.endpoint(path)).toThrow();
  });
  it('sends headers, parameters and request body', () => {
    api.get('tasks', { params: new HttpParams().set('page', 2) }).subscribe();
    const get = http.expectOne('https://example.test/en/tasks?page=2');
    expect(get.request.headers.get('X-Test')).toBe('value');
    get.flush({});
    api.post('form', { name: 'A' }, { localized: false }).subscribe();
    const post = http.expectOne('https://example.test/form');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ name: 'A' });
    post.flush({});
  });
});
