import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  LOCALE_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BenefitsService, type BenefitsResponse } from '@entities/benefit';
import { CombinedPreloader } from '@shared/lib/preloader';
import { finalize } from 'rxjs';
import { BenefitsMarquee } from './benefits-marquee';

type LoadingState = 'loading' | 'ready' | 'error';

interface TitlePart {
  readonly text: string;
  readonly highlighted: boolean;
}

interface InterfaceCopy {
  readonly eyebrow: string;
  readonly loading: string;
  readonly error: string;
  readonly retry: string;
}

const interfaceCopy: Readonly<Record<'en' | 'ru' | 'ua', InterfaceCopy>> = {
  en: {
    eyebrow: 'MULTI-BENEFITS',
    loading: 'Loading benefits',
    error: 'Benefits could not be loaded.',
    retry: 'Try again',
  },
  ru: {
    eyebrow: 'ПРЕИМУЩЕСТВА',
    loading: 'Загружаем преимущества',
    error: 'Не удалось загрузить преимущества.',
    retry: 'Повторить',
  },
  ua: {
    eyebrow: 'ПЕРЕВАГИ',
    loading: 'Завантажуємо переваги',
    error: 'Не вдалося завантажити переваги.',
    retry: 'Спробувати ще раз',
  },
};

@Component({
  selector: 'app-multi-benefits',
  standalone: true,
  imports: [BenefitsMarquee],
  templateUrl: './multi-benefits.html',
  styleUrl: './multi-benefits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiBenefits {
  private readonly benefitsService = inject(BenefitsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preloader = inject(CombinedPreloader);
  private readonly locale = inject(LOCALE_ID);

  readonly state = signal<LoadingState>('loading');
  readonly content = signal<BenefitsResponse | null>(null);
  readonly copy = interfaceCopy[this.language];
  readonly titleParts = computed<readonly TitlePart[]>(() => {
    const title = this.content()?.title ?? '';
    return title
      .split(/(guaranteed|гарантировать|гарантувати)/gi)
      .filter(Boolean)
      .map((text) => ({
        text,
        highlighted: /^(guaranteed|гарантировать|гарантувати)$/i.test(text),
      }));
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.content.set(null);
    const finishLoading = this.preloader.begin('api', 'benefits');

    this.benefitsService
      .getBenefits(this.language)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(finishLoading))
      .subscribe({
        next: (content) => {
          if (!content.title || !content.description || content.benefits.length === 0) {
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
