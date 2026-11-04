import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  output,
  signal,
} from '@angular/core';
import {ViewportService} from "@shared/services/viewport.service";

const FAKE_PROGRESS = 75;
const FAKE_PROGRESS_DURATION = 2000;
const FINAL_PROGRESS_DURATION = 500;
const LEAVE_DURATION = 200;

@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.html',
  styleUrl: './preloader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preloader implements AfterViewInit {
  readonly viewport = inject(ViewportService);
  readonly completed = output<void>();
  readonly progress = signal(0);
  readonly isVisible = signal(true);
  readonly isLeaving = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private pageLoaded = false;
  private animationFrame?: number;
  private leaveTimeout?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const onLoad = this.initPageLoading();

    this.registerCleanup(onLoad);
    this.startProgressAnimation();
  }

  private initPageLoading(): () => void {
      this.pageLoaded = this.document.readyState === 'complete';
      this.document.documentElement.classList.add('is-preloading');

      const onLoad = (): void => {
        this.pageLoaded = true;
      };

      window.addEventListener('load', onLoad, { once: true });

      return onLoad;
    }

  private registerCleanup(onLoad: () => void): void {
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('load', onLoad);
        this.document.documentElement.classList.remove('is-preloading');

        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.leaveTimeout) clearTimeout(this.leaveTimeout);
      });
    }

  private startProgressAnimation(): void {
      const startedAt = performance.now();

      const animate = (now: number): void => {
        const elapsed = now - startedAt;
        const elapsedRatio = Math.min(1, elapsed / FAKE_PROGRESS_DURATION);
        const easedRatio = 1 - (1 - elapsedRatio) ** 3;
        const fakeProgress = FAKE_PROGRESS * easedRatio;

        this.progress.set(Math.round(fakeProgress));

        if (elapsed < FAKE_PROGRESS_DURATION || !this.pageLoaded) {
          this.animationFrame = requestAnimationFrame(animate);
          return;
        }

        this.animateFinalProgress(now);
      };

      this.animationFrame = requestAnimationFrame(animate);
    }

  private animateFinalProgress(startedAt: number): void {
    const animate = (now: number): void => {
      const elapsed = now - startedAt;
      const progress = FAKE_PROGRESS + (elapsed / FINAL_PROGRESS_DURATION) * (100 - FAKE_PROGRESS);
      this.progress.set(Math.min(100, Math.round(progress)));

      if (elapsed < FINAL_PROGRESS_DURATION) {
        this.animationFrame = requestAnimationFrame(animate);
        return;
      }

      this.isLeaving.set(true);
      this.leaveTimeout = setTimeout(() => {
        this.isVisible.set(false);
        this.document.documentElement.classList.remove('is-preloading');
        this.completed.emit();
      }, LEAVE_DURATION);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  protected readonly visualViewport = visualViewport;
}
