import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { validateResponse } from '@shared/lib/validation';
import { map, type Observable } from 'rxjs';
import { multiplyResponseSchema, type MultiplyResponse } from '../model';

export type MultiplyLanguage = ApiLanguage;

@Injectable({ providedIn: 'root' })
export class MultiplyService {
  private readonly api = inject(ApiClient);

  getMultiply(language?: MultiplyLanguage): Observable<MultiplyResponse> {
    return this.api
      .get<unknown>('multiply', { locale: language })
      .pipe(map((response) => validateResponse(multiplyResponseSchema, response)));
  }
}
