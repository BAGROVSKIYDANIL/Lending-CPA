import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksService, type TasksResponse } from '@entities/task';
import { CombinedPreloader } from '@shared/lib/preloader';
import { finalize, type Subscription } from 'rxjs';
import { ViewportService } from '@shared/services/viewport.service';
import { LanguageService, type Language } from '@shared/i18n';
import {
  NativeSectionAnimationController,
  type SectionAnimationDefinition,
} from '@shared/lib/section-navigation';

const tasksEnter = [
  {
    selector: '.multi-tasks__heading',
    keyframes: [{ transform: 'translateY(-140%)' }, { transform: 'translateY(0)' }],
    options: { duration: 720, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multi-tasks__intro',
    keyframes: [{ transform: 'translateX(-115%)' }, { transform: 'translateX(0)' }],
    options: { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multi-tasks__card',
    keyframes: [
      { opacity: 0, transform: 'translateX(115%)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: {
      duration: 620,
      delay: 220,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both' as const,
    },
    stagger: 70,
  },
] as const;

const tasksLeave = [
  {
    selector: '.multi-tasks',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 180, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multi-tasks__heading',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-140%)' }],
    options: { duration: 480, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.multi-tasks__intro',
    keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-115%)' }],
    options: { duration: 520, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.multi-tasks__card',
    keyframes: [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(115%)' },
    ],
    options: { duration: 460, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
    stagger: 35,
  },
] as const;

const tasksAnimation: SectionAnimationDefinition = {
  enter: { forward: tasksEnter, backward: tasksEnter },
  leave: { forward: tasksLeave, backward: tasksLeave },
};

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tasksService = inject(TasksService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preloader = inject(CombinedPreloader);
  private readonly locale = inject(LOCALE_ID);
  private activeRequest?: Subscription;

  readonly state = signal<LoadingState>('loading');
  readonly content = signal<TasksResponse | null>(null);
  private readonly languageService = inject(LanguageService);
  readonly currentLanguage = this.languageService.language;
  readonly copy = computed(() => {
    return interfaceCopy[this.currentLanguage()];
  });
  readonly viewport = inject(ViewportService);
  readonly animationController = new NativeSectionAnimationController(this.host, tasksAnimation);

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
    effect(() => this.loadForLanguage(this.currentLanguage()));
  }

  load(): void {
    this.loadForLanguage(this.currentLanguage());
  }

  private loadForLanguage(language: Language): void {
    this.activeRequest?.unsubscribe();
    this.state.set('loading');
    this.content.set(null);
    const finishLoading = this.preloader.begin('api', 'tasks');

    this.activeRequest = this.tasksService
      .getTasks(language)
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
}
