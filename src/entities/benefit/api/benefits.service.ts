import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { validateResponse } from '@shared/lib/validation';
import { map, type Observable } from 'rxjs';
import { benefitsResponseSchema, type BenefitsResponse } from '../model';

export type BenefitsLanguage = ApiLanguage;

@Injectable({ providedIn: 'root' })
export class BenefitsService {
  private readonly api = inject(ApiClient);

  getBenefits(language?: BenefitsLanguage): Observable<BenefitsResponse> {
    return this.api
      .get<unknown>('benefits', { locale: language })
      .pipe(map((response) => validateResponse(benefitsResponseSchema, response)));
  }
}
