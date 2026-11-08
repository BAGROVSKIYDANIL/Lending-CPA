import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@shared/api';
import { of } from 'rxjs';
import { BenefitsService } from '@entities/benefit';

describe('BenefitsService', () => {
  it('requests localized benefits and rejects an invalid response', () => {
    const get = jasmine.createSpy().and.returnValue(of(null));
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { get } }] });
    let failed = false;
    TestBed.inject(BenefitsService).getBenefits('ua').subscribe({ error: () => { failed = true; } });
    expect(get).toHaveBeenCalledWith('benefits', { locale: 'ua' });
    expect(failed).toBeTrue();
  });
});
