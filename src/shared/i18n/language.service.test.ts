import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  it('falls back for invalid saved languages and persists changes', async () => {
    const currentLang = signal('en');
    const use = jasmine.createSpy().and.returnValue(of({}));
    TestBed.configureTestingModule({ providers: [{ provide: TranslateService, useValue: { currentLang, use } }] });
    const service = TestBed.inject(LanguageService);
    spyOn(localStorage, 'getItem').and.returnValue('invalid');
    const save = spyOn(localStorage, 'setItem');
    const previousLang = document.documentElement.lang;
    expect(service.getInitialLanguage()).toBe('en');
    await service.changeLanguage('ua');
    expect(use).toHaveBeenCalledWith('ua');
    expect(save).toHaveBeenCalledWith('language', 'ua');
    expect(document.documentElement.lang).toBe('ua');
    document.documentElement.lang = previousLang;
  });
});
