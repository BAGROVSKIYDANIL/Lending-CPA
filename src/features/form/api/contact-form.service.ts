import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@shared/api';
import { emptyResponseSchema, validateRequest, validateResponse } from '@shared/lib/validation';
import { defer, map, type Observable } from 'rxjs';
import { type ApplicationData, type ContactMethod } from '../model/contact-validation';
import {
  contactFormRequestSchema,
  type ContactApiMethod,
  type ContactFormRequest,
} from '../model/contact-form.schema';

@Injectable({ providedIn: 'root' })
export class ContactFormService {
  private readonly api = inject(ApiClient);

  submit(data: ApplicationData): Observable<void> {
    return defer(() => {
      const request = validateRequest(contactFormRequestSchema, {
        name: data.name,
        method: this.toApiMethod(data.method),
        contact: data.contact,
      });

      return this.api.post<unknown, ContactFormRequest>('form', request, { localized: false }).pipe(
        map((response) => {
          validateResponse(emptyResponseSchema, response);
          return undefined;
        }),
      );
    });
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
