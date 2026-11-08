import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { validateResponse } from '@shared/lib/validation';
import { map, type Observable } from 'rxjs';
import { tasksResponseSchema, type TasksResponse } from '../model';

export type TaskLanguage = ApiLanguage;

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(ApiClient);

  getTasks(language?: TaskLanguage): Observable<TasksResponse> {
    return this.api
      .get<unknown>('tasks', { locale: language })
      .pipe(map((response) => validateResponse(tasksResponseSchema, response)));
  }
}
