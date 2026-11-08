import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { FallbackPopup } from './fallback-popup';

describe('FallbackPopup', () => {
  it('delegates close and prevents retry until the countdown finishes', async () => {
    const popup = { state: signal(null), close: jasmine.createSpy(), retry: jasmine.createSpy().and.resolveTo() };
    await TestBed.configureTestingModule({ imports: [FallbackPopup], providers: [{ provide: FallbackPopupService, useValue: popup }] })
      .overrideComponent(FallbackPopup, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(FallbackPopup);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.retrySeconds.set(1);
    component.retry();
    expect(popup.retry).not.toHaveBeenCalled();
    component.retrySeconds.set(0);
    component.retry();
    component.close();
    expect(popup.retry).toHaveBeenCalledTimes(1);
    expect(popup.close).toHaveBeenCalledTimes(1);
  });
});
