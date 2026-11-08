import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BenefitsService, type BenefitsResponse } from '@entities/benefit';
import { CombinedPreloader } from '@shared/lib/preloader';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { finalize, firstValueFrom, type Subscription } from 'rxjs';
import { BenefitsMarquee } from '@widgets/multi-benefits/ui/benefits-marquee';
import { LanguageService, type Language } from '@shared/i18n';
import { ViewportService } from '@shared/services/viewport.service';
import {
  NativeSectionAnimationController,
  type SectionAnimationDefinition,
} from '@shared/lib/section-navigation';

const benefitsEnter = [
  {
    selector: '.multi-benefits__eyebrow',
    keyframes: [{ transform: 'translateY(-160%)' }, { transform: 'translateY(0)' }],
    options: { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multi-benefits__intro',
    keyframes: [
      { opacity: 0, transform: 'translateX(-115%)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 760, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multi-benefits__cards',
    keyframes: [{ transform: 'translateX(115%)' }, { transform: 'translateX(0)' }],
    options: { duration: 760, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: 'app-benefits-marquee',
    keyframes: [
      { opacity: 0, transform: 'translateY(100%)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 540, delay: 280, easing: 'ease-out', fill: 'both' as const },
  },
] as const;

const benefitsLeave = [
  {
    selector: '.multi-benefits',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 180, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multi-benefits__eyebrow',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-160%)' }],
    options: { duration: 420, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multi-benefits__intro',
    keyframes: [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(-115%)' },
    ],
    options: { duration: 520, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.multi-benefits__cards',
    keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(115%)' }],
    options: { duration: 520, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: 'app-benefits-marquee',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(100%)' },
    ],
    options: { duration: 420, easing: 'ease-in', fill: 'both' as const },
  },
] as const;

const benefitsAnimation: SectionAnimationDefinition = {
  enter: { forward: benefitsEnter, backward: benefitsEnter },
  leave: { forward: benefitsLeave, backward: benefitsLeave },
};

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly benefitsService = inject(BenefitsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preloader = inject(CombinedPreloader);
  private activeRequest?: Subscription;
  private readonly fallbackPopup = inject(FallbackPopupService);

  readonly viewport = inject(ViewportService);
  readonly state = signal<LoadingState>('loading');
  readonly content = signal<BenefitsResponse | null>(null);
  readonly animationController = new NativeSectionAnimationController(this.host, benefitsAnimation);
  private readonly languageService = inject(LanguageService);
  readonly currentLanguage = this.languageService.language;
  readonly copy = computed(() => {
    return interfaceCopy[this.currentLanguage()];
  });
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
    effect(() => this.loadForLanguage(this.currentLanguage()));
  }

  load(): void {
    this.loadForLanguage(this.currentLanguage());
  }

  private loadForLanguage(language: Language): void {
    this.activeRequest?.unsubscribe();
    this.state.set('loading');
    this.content.set(null);
    const finishLoading = this.preloader.begin('api', 'benefits');

    this.activeRequest = this.benefitsService
      .getBenefits(language)
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
        error: (error: unknown) => {
          this.state.set('error');
          this.fallbackPopup.showError(error, {
            owner: this.destroyRef,
            retry: () => this.reload(),
          });
        },
      });
  }

  private async reload(): Promise<void> {
    this.state.set('loading');
    const content = await firstValueFrom(this.benefitsService.getBenefits(this.currentLanguage()));
    if (!content.title || !content.description || content.benefits.length === 0) {
      throw new Error('Empty benefits response.');
    }
    this.content.set(content);
    this.state.set('ready');
  }
}
