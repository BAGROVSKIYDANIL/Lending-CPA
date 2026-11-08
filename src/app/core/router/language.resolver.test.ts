import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { LanguageService } from '@shared/i18n';
import { languageResolver } from './language.resolver';

describe('languageResolver', () => {
  it('changes supported languages and rejects unknown ones', async () => {
    const changeLanguage = jasmine.createSpy().and.resolveTo();
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { changeLanguage } }] });
    const route = (lang: string) => ({ paramMap: convertToParamMap({ lang }) }) as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(await TestBed.runInInjectionContext(() => languageResolver(route('ru'), state))).toBeTrue();
    expect(changeLanguage).toHaveBeenCalledOnceWith('ru');
    expect(await TestBed.runInInjectionContext(() => languageResolver(route('xx'), state))).toBeFalse();
  });
});
