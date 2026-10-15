import { inject, Injectable } from '@angular/core';
import { ApiClient, type ApiLanguage } from '@shared/api';
import { Observable } from 'rxjs';

export type TaskLanguage = ApiLanguage;

export interface TaskTile {
  readonly title: string;
  readonly text: string;
}

export interface TasksResponse {
  readonly description: string;
  readonly tiles: readonly TaskTile[];
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(ApiClient);

  getTasks(language?: TaskLanguage): Observable<TasksResponse> {
    return this.api.get<TasksResponse>('tasks', { locale: language });
  }
}
