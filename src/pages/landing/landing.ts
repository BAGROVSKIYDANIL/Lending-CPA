import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Hero } from '@pages/hero/hero';
import { MultiBenefits } from '@pages/multi-benefits/multi-benefits';
import { MultiTasks } from '@pages/multi-tasks/multi-tasks';
import { MultiplyWithUs } from '@pages/multiply-with-us/multiply-with-us';
import {
  SectionNavigationService,
  SectionTransitionEngine,
  isSectionId,
  type SectionId,
} from '@shared/lib/section-navigation';
import { ViewportService } from '@shared/services/viewport.service';

@Component({
  selector: 'app-landing',
  imports: [Hero, MultiTasks, MultiBenefits, MultiplyWithUs],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transitionEngine = inject(SectionTransitionEngine);
  readonly navigation = inject(SectionNavigationService);
  readonly viewport = inject(ViewportService);

  private readonly hero = viewChild.required(Hero);
  private readonly team = viewChild.required(MultiTasks);
  private readonly benefits = viewChild.required(MultiBenefits);
  private readonly join = viewChild.required(MultiplyWithUs);
  private viewReady = false;
  private desktopEnabled = false;
  private wheelDelta = 0;
  private wheelDirection = 0;
  private wheelTriggered = false;
  private lastWheelAt = 0;
  private wheelFrame = 0;

  constructor() {
    effect(() => {
      const mobile = this.viewport.isMobile();
      if (this.viewReady) this.applyViewportMode(mobile);
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('keydown', this.onKeydown);
      cancelAnimationFrame(this.wheelFrame);
      this.navigation.disable();
      this.unregisterControllers();
    });
  }

  ngAfterViewInit(): void {
    this.registerControllers();
    this.viewReady = true;
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeydown);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.handleUrlChange());
    this.applyViewportMode(this.viewport.isMobile());
  }

  isVisible(section: SectionId): boolean {
    return this.viewport.isMobile() || this.navigation.visibleSections().includes(section);
  }

  isTarget(section: SectionId): boolean {
    return this.navigation.targetSection() === section;
  }

  private readonly onWheel = (event: WheelEvent): void => {
    if (!this.desktopEnabled || this.isModalEvent(event)) return;
    event.preventDefault();

    const now = performance.now();
    if (now - this.lastWheelAt > 180) this.resetWheelGesture();
    this.lastWheelAt = now;

    const direction = Math.sign(event.deltaY);
    if (direction === 0) return;
    if (this.wheelDirection !== 0 && direction !== this.wheelDirection) this.resetWheelGesture();
    this.wheelDirection = direction;
    this.wheelDelta += event.deltaY;

    if (!this.wheelTriggered && Math.abs(this.wheelDelta) >= 24) {
      this.wheelTriggered = true;
      if (direction > 0) this.navigation.next();
      else this.navigation.previous();
    }
    if (!this.wheelFrame) this.wheelFrame = requestAnimationFrame(this.monitorWheelGesture);
  };

  private readonly monitorWheelGesture = (): void => {
    if (performance.now() - this.lastWheelAt > 180) {
      this.resetWheelGesture();
      this.wheelFrame = 0;
      return;
    }
    this.wheelFrame = requestAnimationFrame(this.monitorWheelGesture);
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (!this.desktopEnabled || this.isModalEvent(event) || this.isEditableTarget(event.target))
      return;
    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      (event.key === ' ' && !event.shiftKey)
    ) {
      event.preventDefault();
      this.navigation.next();
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'PageUp' ||
      (event.key === ' ' && event.shiftKey)
    ) {
      event.preventDefault();
      this.navigation.previous();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.navigation.navigateTo('hero');
    } else if (event.key === 'End') {
      event.preventDefault();
      this.navigation.navigateTo('join');
    }
  };

  private applyViewportMode(mobile: boolean): void {
    this.desktopEnabled = !mobile;
    if (mobile) {
      this.navigation.disable();
      requestAnimationFrame(() => this.scrollToHash());
      return;
    }
    void this.navigation.initialize(this.sectionFromUrl());
  }

  private handleUrlChange(): void {
    const section = this.sectionFromUrl();
    if (this.desktopEnabled) {
      this.navigation.navigateTo(section, { updateUrl: false, queue: true });
    } else {
      requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView());
    }
  }

  private sectionFromUrl(): SectionId {
    const fragment = this.router.parseUrl(this.router.url).fragment;
    return isSectionId(fragment) ? fragment : 'hero';
  }

  private scrollToHash(): void {
    document.getElementById(this.sectionFromUrl())?.scrollIntoView();
  }

  private resetWheelGesture(): void {
    this.wheelDelta = 0;
    this.wheelDirection = 0;
    this.wheelTriggered = false;
  }

  private isModalEvent(event: Event): boolean {
    const target = event.target instanceof Element ? event.target : null;
    return (
      !!target?.closest('dialog, [aria-modal="true"], .cdk-overlay-container') ||
      !!document.querySelector('dialog:modal')
    );
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLElement &&
      !!target.closest('input, textarea, select, button, [contenteditable="true"]')
    );
  }

  private registerControllers(): void {
    this.transitionEngine.register('hero', this.hero().animationController);
    this.transitionEngine.register('team', this.team().animationController);
    this.transitionEngine.register('benefits', this.benefits().animationController);
    this.transitionEngine.register('join', this.join().animationController);
  }

  private unregisterControllers(): void {
    if (!this.viewReady) return;
    this.transitionEngine.unregister('hero', this.hero().animationController);
    this.transitionEngine.unregister('team', this.team().animationController);
    this.transitionEngine.unregister('benefits', this.benefits().animationController);
    this.transitionEngine.unregister('join', this.join().animationController);
  }
}
