import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@shared/api';
import { of } from 'rxjs';
import { ContactFormService } from '@features/form';

describe('ContactFormService', () => {
  it('maps each contact method and uses the unlocalized form endpoint', () => {
    const post = jasmine.createSpy().and.returnValue(of(null));
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { post } }] });
    const service = TestBed.inject(ContactFormService);
    for (const [method, expected, contact] of [['Telegram', 'telegram', '@user1'], ['WhatsApp', 'whatsapp', '+37360123456'], ['Email', 'email', 'a@example.com']] as const) {
      service.submit({ name: 'Jane', method, contact }).subscribe();
      expect(post).toHaveBeenCalledWith('form', { name: 'Jane', method: expected, contact }, { localized: false });
    }
  });
  it('does not send an invalid email', () => {
    const post = jasmine.createSpy();
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { post } }] });
    let failed = false;
    TestBed.inject(ContactFormService).submit({ name: '', method: 'Email', contact: 'bad' }).subscribe({ error: () => { failed = true; } });
    expect(failed).toBeTrue();
    expect(post).not.toHaveBeenCalled();
  });
});
