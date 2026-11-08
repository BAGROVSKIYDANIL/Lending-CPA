import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, convertToParamMap, provideRouter } from '@angular/router';
import { languageGuard } from './language.guard';

describe('languageGuard', () => {
  it('accepts supported languages and redirects invalid ones', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const route = (lang: string) => ({ paramMap: convertToParamMap({ lang }) }) as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(TestBed.runInInjectionContext(() => languageGuard(route('ua'), state))).toBeTrue();
    const result = TestBed.runInInjectionContext(() => languageGuard(route('xx'), state));
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe('/en/404');
  });
});
