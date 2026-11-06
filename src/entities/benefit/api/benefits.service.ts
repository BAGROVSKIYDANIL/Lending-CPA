import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { Observable } from 'rxjs';

export type BenefitsLanguage = ApiLanguage;

export interface BenefitsResponse {
  readonly title: string;
  readonly description: string;
  readonly benefits: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class BenefitsService {
  private readonly api = inject(ApiClient);

  getBenefits(language?: BenefitsLanguage): Observable<BenefitsResponse> {
    return this.api.get<BenefitsResponse>('benefits', { locale: language });
  }
}
