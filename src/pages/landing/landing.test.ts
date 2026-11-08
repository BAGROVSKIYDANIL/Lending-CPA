import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SectionNavigationService, SectionTransitionEngine } from '@shared/lib/section-navigation';
import { ViewportService } from '@shared/services/viewport.service';
import { Landing } from './landing';

describe('Landing', () => {
  it('shows all sections on mobile and only active sections on desktop', async () => {
    const mobile = signal(true);
    const navigation = { visibleSections: signal(['hero']), targetSection: signal('team'), disable: jasmine.createSpy() };
    await TestBed.configureTestingModule({ imports: [Landing], providers: [provideRouter([]),
      { provide: ViewportService, useValue: { isMobile: mobile } },
      { provide: SectionNavigationService, useValue: navigation },
      { provide: SectionTransitionEngine, useValue: {} },
    ] }).overrideComponent(Landing, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(Landing);
    expect(fixture.componentInstance.isVisible('join')).toBeTrue();
    mobile.set(false);
    expect(fixture.componentInstance.isVisible('join')).toBeFalse();
    expect(fixture.componentInstance.isVisible('hero')).toBeTrue();
    expect(fixture.componentInstance.isTarget('team')).toBeTrue();
    fixture.destroy();
    expect(navigation.disable).toHaveBeenCalled();
  });
});
