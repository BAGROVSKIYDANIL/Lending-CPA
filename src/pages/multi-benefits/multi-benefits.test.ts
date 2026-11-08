import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BenefitsService } from '@entities/benefit';
import { LanguageService } from '@shared/i18n';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { CombinedPreloader } from '@shared/lib/preloader';
import { ViewportService } from '@shared/services/viewport.service';
import { Subject } from 'rxjs';
import { MultiBenefits } from './multi-benefits';

describe('MultiBenefits', () => {
  it('loads content, highlights the title, and releases the preloader', async () => {
    const response = new Subject<{ title: string; description: string; benefits: string[] }>();
    const finish = jasmine.createSpy();
    await TestBed.configureTestingModule({ imports: [MultiBenefits], providers: [
      { provide: BenefitsService, useValue: { getBenefits: () => response } },
      { provide: LanguageService, useValue: { language: signal('en') } },
      { provide: ViewportService, useValue: { isMobile: signal(true) } },
      { provide: CombinedPreloader, useValue: { begin: () => finish } },
      { provide: FallbackPopupService, useValue: { showError: jasmine.createSpy() } },
    ] }).overrideComponent(MultiBenefits, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(MultiBenefits);
    fixture.detectChanges();
    expect(fixture.componentInstance.state()).toBe('loading');
    response.next({ title: 'Guaranteed growth', description: 'Description', benefits: ['One'] });
    response.complete();
    expect(fixture.componentInstance.state()).toBe('ready');
    expect(fixture.componentInstance.titleParts()[0].highlighted).toBeTrue();
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
