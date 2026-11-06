import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { Observable } from 'rxjs';

export type MultiplyLanguage = ApiLanguage;

export interface MultiplySteps {
  readonly step_1: string;
  readonly step_2: string;
}

export interface MultiplyItem {
  readonly title: string;
  readonly steps: MultiplySteps;
}

@Injectable({ providedIn: 'root' })
export class MultiplyService {
  private readonly api = inject(ApiClient);

  getMultiply(language?: MultiplyLanguage): Observable<readonly MultiplyItem[]> {
    return this.api.get<readonly MultiplyItem[]>('multiply', { locale: language });
  }
}
