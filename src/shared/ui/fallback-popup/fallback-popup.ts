import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { FallbackPopupService, type FallbackPopupData } from '@shared/lib/fallback-popup';

@Component({
  selector: 'app-fallback-popup',
  standalone: true,
  templateUrl: './fallback-popup.html',
  styleUrl: './fallback-popup.scss',
})
export class FallbackPopup implements OnDestroy {
  readonly popup = inject(FallbackPopupService);
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  readonly retrySeconds = signal(0);

  private readonly document = inject(DOCUMENT);
  private activeId?: symbol;
  private activeData?: FallbackPopupData;
  private previousFocus?: HTMLElement;
  private previousOverflow = '';
  private documentLocked = false;
  private countdown?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => this.syncDialog(this.popup.state()));
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.restoreDocument();
  }

  close(): void {
    this.popup.close();
  }

  retry(): void {
    if (this.retrySeconds() > 0) return;
    void this.popup.retry();
  }

  private syncDialog(state: ReturnType<FallbackPopupService['state']>): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) return;

    if (!state) {
      if (dialog.open) dialog.close();
      this.activeId = undefined;
      this.activeData = undefined;
      this.stopCountdown();
      this.restoreDocument();
      return;
    }

    if (this.activeId !== state.id || this.activeData !== state.data) {
      this.activeId = state.id;
      this.activeData = state.data;
      this.startCountdown(state.data.retryAfterSeconds ?? 0);
    }

    if (dialog.open) return;
    this.previousFocus =
      this.document.activeElement instanceof HTMLElement ? this.document.activeElement : undefined;
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.documentLocked = true;
    dialog.showModal();
    queueMicrotask(() => dialog.querySelector<HTMLElement>('.fallback-popup__close')?.focus());
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown();
    this.retrySeconds.set(seconds);
    if (seconds <= 0) return;

    this.countdown = setInterval(() => {
      const remaining = this.retrySeconds() - 1;
      this.retrySeconds.set(Math.max(0, remaining));
      if (remaining <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdown) clearInterval(this.countdown);
    this.countdown = undefined;
  }

  private restoreDocument(): void {
    if (this.documentLocked) {
      this.document.body.style.overflow = this.previousOverflow;
      this.documentLocked = false;
    }
    if (!this.previousFocus) return;
    const previousFocus = this.previousFocus;
    this.previousFocus = undefined;
    queueMicrotask(() => previousFocus.isConnected && previousFocus.focus());
  }
}
