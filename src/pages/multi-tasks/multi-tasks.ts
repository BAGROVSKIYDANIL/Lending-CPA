import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  LOCALE_ID,
  inject,
  signal, computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksService, type TasksResponse } from '@entities/task';
import { CombinedPreloader } from '@shared/lib/preloader';
import { finalize } from 'rxjs';
import {ViewportService} from "@shared/services/viewport.service";

type LoadingState = 'loading' | 'ready' | 'error';

interface descriptionPart {
  readonly text: string;
  readonly highlighted: boolean;
}

interface InterfaceCopy {
  readonly heading: string;
  readonly loading: string;
  readonly error: string;
  readonly retry: string;
}

const interfaceCopy: Readonly<Record<'en' | 'ru' | 'ua', InterfaceCopy>> = {
  en: {
    heading: 'MULTI-TASKS',
    loading: 'Loading tasks',
    error: 'Tasks could not be loaded.',
    retry: 'Try again',
  },
  ru: {
    heading: 'МУЛЬТИЗАДАЧНОСТЬ',
    loading: 'Загружаем задачи',
    error: 'Не удалось загрузить задачи.',
    retry: 'Повторить',
  },
  ua: {
    heading: 'БАГАТОЗАДАЧНІСТЬ',
    loading: 'Завантажуємо завдання',
    error: 'Не вдалося завантажити завдання.',
    retry: 'Спробувати ще раз',
  },
};

@Component({
  selector: 'app-multi-tasks',
  styleUrl: './multi-tasks.scss',
  templateUrl: './multi-tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiTasks {
  private readonly tasksService = inject(TasksService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preloader = inject(CombinedPreloader);
  private readonly locale = inject(LOCALE_ID);

  readonly state = signal<LoadingState>('loading');
  readonly content = signal<TasksResponse | null>(null);
  readonly copy = interfaceCopy[this.language];
  readonly viewport = inject(ViewportService)

  readonly descriptionPart = computed<readonly descriptionPart[]>(() => {
    const title = this.content()?.description ?? '';
    return title
        .split(/(in-house team|своя команда)/gi)
        .filter(Boolean)
        .map((text) => ({
          text,
          highlighted: /^(in-house team|своя команда)$/i.test(text),
        }));
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.content.set(null);
    const finishLoading = this.preloader.begin('api', 'tasks');

    this.tasksService
      .getTasks(this.language)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(finishLoading))
      .subscribe({
        next: (content) => {
          if (!content.description || content.tiles.length === 0) {
            this.state.set('error');
            return;
          }

          this.content.set(content);
          this.state.set('ready');
        },
        error: () => this.state.set('error'),
      });
  }

  private get language(): 'en' | 'ru' | 'ua' {
    const language = this.locale.toLowerCase().split('-')[0];
    return language === 'ru' || language === 'ua' ? language : 'en';
  }
}
