import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MultiplyService } from '@entities/multiply';
import { ContactFormService } from '@features/form';
import { LanguageService } from '@shared/i18n';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { of, throwError } from 'rxjs';
import { MultiplyWithUs } from './multiply-with-us';

describe('MultiplyWithUs', () => {
  it('loads category content and reports submission errors', async () => {
    const items = ['first', 'second', 'third'].map((title) => ({ title, steps: { step_1: 'one', step_2: 'two' } }));
    const popup = { showError: jasmine.createSpy(), showClientError: jasmine.createSpy() };
    const error = new Error('failed');
    await TestBed.configureTestingModule({ imports: [MultiplyWithUs], providers: [
      { provide: MultiplyService, useValue: { getMultiply: () => of(items) } },
      { provide: ContactFormService, useValue: { submit: () => throwError(() => error) } },
      { provide: FallbackPopupService, useValue: popup },
      { provide: LanguageService, useValue: { language: signal('en') } },
    ] }).overrideComponent(MultiplyWithUs, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(MultiplyWithUs);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.status()).toBe('loaded');
    component.selectCategory('businesses');
    expect(component.activeContent()?.title).toBe('second');
    component.openForm();
    expect(component.formOpen()).toBeTrue();
    component.closeForm();
    component.submitApplication({ name: 'Jane', method: 'Email', contact: 'a@example.com' });
    expect(popup.showError).toHaveBeenCalled();
  });
});
