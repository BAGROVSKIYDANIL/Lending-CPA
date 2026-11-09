import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ResponseValidationError } from '@shared/lib/validation';
import { mapHttpError, type HttpErrorMappingOptions } from '@shared/model/error';

export interface FallbackPopupData {
  readonly title: string;
  readonly message: string;
  readonly code?: string;
  readonly retry?: () => void | Promise<void>;
  readonly retryAfterSeconds?: number;
}

export interface ShowFallbackPopupOptions {
  readonly owner?: DestroyRef;
}

export interface ShowErrorOptions extends HttpErrorMappingOptions, ShowFallbackPopupOptions {
  readonly retry?: () => void | Promise<void>;
}

export type FallbackPopupStatus = 'open' | 'retrying';

export interface FallbackPopupState {
  readonly id: symbol;
  readonly data: FallbackPopupData;
  readonly status: FallbackPopupStatus;
}

@Injectable({ providedIn: 'root' })
export class FallbackPopupService {
  private readonly translateService = inject(TranslateService);
  private readonly popupState = signal<FallbackPopupState | null>(null);
  readonly state = this.popupState.asReadonly();

  show(data: FallbackPopupData, options: ShowFallbackPopupOptions = {}): () => void {
    const id = Symbol('fallback-popup');
    this.popupState.set({ id, data, status: 'open' });
    options.owner?.onDestroy(() => {
      this.popupState.update((state) => {
        if (state?.id !== id || !state.data.retry) return state;
        return { ...state, data: { ...state.data, retry: undefined } };
      });
    });
    return () => this.close(id);
  }

  showError(error: unknown, options: ShowErrorOptions = {}): () => void {
    if (error instanceof HttpErrorResponse) return this.showHttpError(error, options);
    if (error instanceof ResponseValidationError) {
      return this.show(
        {
          title: this.translate('fallback.invalidResponseTitle'),
          message: this.translate('fallback.invalidResponseMessage'),
          retry: options.retry,
        },
        { owner: options.owner },
      );
    }
    return this.showClientError(options);
  }

  showClientError(options: ShowErrorOptions = {}): () => void {
    return this.show(
      {
        title: this.translate('fallback.clientTitle'),
        message: this.translate('fallback.clientMessage'),
        retry: options.retry,
      },
      { owner: options.owner },
    );
  }

  showHttpError(error: HttpErrorResponse, options: ShowErrorOptions = {}): () => void {
    const mapped = mapHttpError(error, (key, params) => this.translate(key, params), {
      fieldErrors: options.fieldErrors,
    });
    if (!mapped.showPopup) return () => undefined;
    return this.show(
      {
        title: mapped.title,
        message: mapped.message,
        code: mapped.code,
        retry: mapped.retryable ? options.retry : undefined,
        retryAfterSeconds: mapped.retryAfterSeconds,
      },
      { owner: options.owner },
    );
  }

  close(expectedId?: symbol): void {
    if (expectedId && this.popupState()?.id !== expectedId) return;
    this.popupState.set(null);
  }

  async retry(): Promise<void> {
    const current = this.popupState();
    if (!current?.data.retry || current.status === 'retrying') return;
    this.popupState.set({ ...current, status: 'retrying' });
    try {
      await current.data.retry();
      this.close(current.id);
    } catch (error: unknown) {
      if (this.popupState()?.id !== current.id) return;
      this.close(current.id);
      this.showError(error, { retry: current.data.retry });
    }
  }

  private translate(key: string, params?: Record<string, unknown>): string {
    return this.translateService.instant(key, params) as string;
  }
}
