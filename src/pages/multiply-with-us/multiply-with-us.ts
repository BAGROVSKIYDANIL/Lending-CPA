import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiplyService, type MultiplyItem } from '@entities/multiply';
import { ApplicationForm, ContactFormService, type ApplicationData } from '@features/form';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { firstValueFrom } from 'rxjs';

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
  imports: [ApplicationForm],
  templateUrl: './multiply-with-us.html',
  styleUrl: './multiply-with-us.scss',
})
export class MultiplyWithUs {
  private readonly multiplyService = inject(MultiplyService);
  private readonly contactFormService = inject(ContactFormService);
  private readonly fallbackPopup = inject(FallbackPopupService);
  private readonly destroyRef = inject(DestroyRef);

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
  readonly activeOption = computed(
    () => this.categories.find(({ id }) => id === this.activeCategory()) ?? this.categories[0],
  );
  readonly activeContent = computed(
    () => this.items()[CATEGORY_INDEX[this.activeCategory()]] ?? null,
  );

  constructor() {
    this.loadContent();
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
    this.loadContent();
  }

  private loadContent(): void {
    this.status.set('loading');
    this.multiplyService
      .getMultiply()
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
    if (error instanceof HttpErrorResponse) {
      this.fallbackPopup.showHttpError(error, {
        owner: this.destroyRef,
        retry: () => this.reloadContent(),
      });
      return;
    }

    this.fallbackPopup.showClientError({
      owner: this.destroyRef,
      retry: () => this.reloadContent(),
    });
  }

  private async reloadContent(): Promise<void> {
    this.status.set('loading');
    const items = await firstValueFrom(this.multiplyService.getMultiply());
    this.acceptContent(items);
  }

  private handleFormError(error: unknown): void {
    this.applicationForm()?.fail('');
    if (error instanceof HttpErrorResponse) {
      this.fallbackPopup.showHttpError(error, { owner: this.destroyRef });
      return;
    }

    this.fallbackPopup.showClientError({ owner: this.destroyRef });
  }
}
