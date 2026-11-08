import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@shared/api';
import { of } from 'rxjs';
import { MultiplyService } from './multiply.service';

describe('MultiplyService', () => {
  it('requests localized content and rejects an invalid response', () => {
    const get = jasmine.createSpy().and.returnValue(of(null));
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { get } }] });
    let failed = false;
    TestBed.inject(MultiplyService).getMultiply('ru').subscribe({ error: () => { failed = true; } });
    expect(get).toHaveBeenCalledWith('multiply', { locale: 'ru' });
    expect(failed).toBeTrue();
  });
});
