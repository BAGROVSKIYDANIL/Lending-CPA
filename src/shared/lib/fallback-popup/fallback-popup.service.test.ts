import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { FallbackPopupService } from './fallback-popup.service';

describe('FallbackPopupService', () => {
  let service: FallbackPopupService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: TranslateService, useValue: { instant: (key: string) => key } }] });
    service = TestBed.inject(FallbackPopupService);
  });
  it('does not let an old close callback dismiss a newer popup', () => {
    const close = service.show({ title: 'first', message: '' });
    service.show({ title: 'second', message: '' });
    close();
    expect(service.state()?.data.title).toBe('second');
    service.close();
    expect(service.state()).toBeNull();
  });
  it('closes after a successful retry', async () => {
    const retry = jasmine.createSpy().and.resolveTo();
    service.show({ title: '', message: '', retry });
    await service.retry();
    expect(retry).toHaveBeenCalledTimes(1);
    expect(service.state()).toBeNull();
  });
  it('suppresses field errors and retains retry for server errors', () => {
    service.showHttpError(new HttpErrorResponse({ status: 422 }), { fieldErrors: { name: 'Required' } });
    expect(service.state()).toBeNull();
    const retry = () => {};
    service.showHttpError(new HttpErrorResponse({ status: 503 }), { retry });
    expect(service.state()?.data.retry).toBe(retry);
  });
});
