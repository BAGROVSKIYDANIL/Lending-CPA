import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, signal } from '@angular/core';
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

export interface ShowHttpErrorOptions extends HttpErrorMappingOptions, ShowFallbackPopupOptions {
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

  showClientError(
    options: {
      readonly retry?: () => void | Promise<void>;
      readonly owner?: DestroyRef;
    } = {},
  ): () => void {
    return this.show(
      {
        title: $localize`:@@fallbackError.client.title:Something went wrong`,
        message: $localize`:@@fallbackError.client.message:The operation couldn't be completed. Please try again.`,
        retry: options.retry,
      },
      { owner: options.owner },
    );
  }

  showHttpError(error: HttpErrorResponse, options: ShowHttpErrorOptions = {}): () => void {
    const mapped = mapHttpError(error, { fieldErrors: options.fieldErrors });
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
      if (error instanceof HttpErrorResponse) {
        const mapped = mapHttpError(error);
        if (!mapped.showPopup) {
          this.close(current.id);
          return;
        }
        this.popupState.set({
          id: current.id,
          status: 'open',
          data: {
            title: mapped.title,
            message: mapped.message,
            code: mapped.code,
            retry: mapped.retryable ? current.data.retry : undefined,
            retryAfterSeconds: mapped.retryAfterSeconds,
          },
        });
      } else {
        this.popupState.set({
          id: current.id,
          status: 'open',
          data: {
            title: $localize`:@@fallbackError.client.title:Something went wrong`,
            message: $localize`:@@fallbackError.client.message:The operation couldn't be completed. Please try again.`,
            retry: current.data.retry,
          },
        });
      }
    }
  }
}
