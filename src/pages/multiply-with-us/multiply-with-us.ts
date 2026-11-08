import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiplyService, type MultiplyItem } from '@entities/multiply';
import { ApplicationForm, ContactFormService, type ApplicationData } from '@features/form';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { RequestValidationError } from '@shared/lib/validation';
import { firstValueFrom, type Subscription } from 'rxjs';
import { LanguageService, type Language } from '@shared/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import {
  NativeSectionAnimationController,
  type SectionAnimationDefinition,
} from '@shared/lib/section-navigation';

const joinEnter = [
  {
    selector: '.multiply__title',
    keyframes: [{ transform: 'translateY(-160%)' }, { transform: 'translateY(0)' }],
    options: { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multiply__visual',
    keyframes: [
      { opacity: 0, transform: 'translateX(-115%)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 760, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multiply__content',
    keyframes: [
      { opacity: 0, transform: 'translateX(115%)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 760, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.multiply__footer',
    keyframes: [{ transform: 'translateY(180%)' }, { transform: 'translateY(0)' }],
    options: { duration: 480, delay: 320, easing: 'ease-out', fill: 'both' as const },
  },
  {
    selector: '.multiply__snake',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 240, delay: 620, easing: 'ease-out', fill: 'both' as const },
  },
] as const;

const joinLeave = [
  {
    selector: '.multiply',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 180, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multiply__title',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-160%)' }],
    options: { duration: 420, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multiply__visual',
    keyframes: [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(-115%)' },
    ],
    options: { duration: 520, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.multiply__content',
    keyframes: [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(115%)' },
    ],
    options: { duration: 520, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.multiply__footer',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(180%)' }],
    options: { duration: 380, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.multiply__snake',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 220, easing: 'ease-in', fill: 'both' as const },
  },
] as const;

const joinAnimation: SectionAnimationDefinition = {
  enter: { forward: joinEnter, backward: joinEnter },
  leave: { forward: joinLeave, backward: joinLeave },
};

type MultiplyCategory = 'mediaBuyers' | 'businesses' | 'partners';
type LoadingStatus = 'loading' | 'loaded' | 'error';

interface CategoryOption {
  readonly id: MultiplyCategory;
  readonly label: string;
  readonly cta: string;
}

const CATEGORY_INDEX: Readonly<Record<MultiplyCategory, number>> = {
  mediaBuyers: 0,
  businesses: 1,
  partners: 2,
};

@Component({
  selector: 'app-multiply-with-us',
  standalone: true,
  imports: [ApplicationForm, TranslatePipe, RouterLink],
  templateUrl: './multiply-with-us.html',
  styleUrl: './multiply-with-us.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiplyWithUs {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly multiplyService = inject(MultiplyService);
  private readonly contactFormService = inject(ContactFormService);
  private readonly fallbackPopup = inject(FallbackPopupService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private contentRequest?: Subscription;

  readonly currentLanguage = this.languageService.language;
  readonly animationController = new NativeSectionAnimationController(this.host, joinAnimation);

  readonly applicationForm = viewChild(ApplicationForm);
  readonly categories: readonly CategoryOption[] = [
    { id: 'mediaBuyers', label: 'For Media Buyers', cta: 'JOIN THE TEAM' },
    { id: 'businesses', label: 'For Businesses', cta: 'LAUNCH NOW' },
    { id: 'partners', label: 'For Partners', cta: 'PARTNER UP' },
  ];
  readonly activeCategory = signal<MultiplyCategory>('mediaBuyers');
  readonly status = signal<LoadingStatus>('loading');
  readonly formOpen = signal(false);
  private readonly items = signal<readonly MultiplyItem[]>([]);
  readonly activeContent = computed(
    () => this.items()[CATEGORY_INDEX[this.activeCategory()]] ?? null,
  );

  constructor() {
    effect(() => this.loadContent(this.currentLanguage()));
  }

  selectCategory(category: MultiplyCategory): void {
    this.activeCategory.set(category);
  }

  openForm(): void {
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  submitApplication(data: ApplicationData): void {
    this.contactFormService
      .submit(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.applicationForm()?.complete(),
        error: (error: unknown) => this.handleFormError(error),
      });
  }

  retry(): void {
    this.loadContent(this.currentLanguage());
  }

  private loadContent(language: Language): void {
    this.contentRequest?.unsubscribe();
    this.status.set('loading');
    this.items.set([]);
    this.contentRequest = this.multiplyService
      .getMultiply(language)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.acceptContent(items),
        error: (error: unknown) => this.handleContentError(error),
      });
  }

  private acceptContent(items: readonly MultiplyItem[]): void {
    if (items.length < this.categories.length) {
      this.status.set('error');
      this.fallbackPopup.showClientError({ owner: this.destroyRef });
      return;
    }

    this.items.set(items);
    this.status.set('loaded');
  }

  private handleContentError(error: unknown): void {
    this.status.set('error');
    this.fallbackPopup.showError(error, {
      owner: this.destroyRef,
      retry: () => this.reloadContent(),
    });
  }

  private async reloadContent(): Promise<void> {
    this.status.set('loading');
    const items = await firstValueFrom(this.multiplyService.getMultiply(this.currentLanguage()));
    this.acceptContent(items);
  }

  private handleFormError(error: unknown): void {
    if (error instanceof RequestValidationError) {
      this.applicationForm()?.applyValidationErrors(error.fieldErrors);
      return;
    }
    this.applicationForm()?.fail();
    this.fallbackPopup.showError(error, { owner: this.destroyRef });
  }
}
