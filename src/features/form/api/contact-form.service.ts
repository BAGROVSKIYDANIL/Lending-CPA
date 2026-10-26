import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@shared/api';
import { Observable } from 'rxjs';
import { ApplicationData, type ContactMethod } from '../model/contact-validation';

type ContactApiMethod = 'telegram' | 'whatsapp' | 'email';

interface ContactFormRequest {
  readonly name: string;
  readonly method: ContactApiMethod;
  readonly contact: string;
}

@Injectable({ providedIn: 'root' })
export class ContactFormService {
  private readonly api = inject(ApiClient);

  submit(data: ApplicationData): Observable<void> {
    const request: ContactFormRequest = {
      name: data.name,
      method: this.toApiMethod(data.method),
      contact: data.contact,
    };

    return this.api.post<void, ContactFormRequest>('form', request, { localized: false });
  }

  private toApiMethod(method: ContactMethod): ContactApiMethod {
    switch (method) {
      case 'Telegram':
        return 'telegram';
      case 'WhatsApp':
        return 'whatsapp';
      case 'Email':
        return 'email';
    }
  }
}
