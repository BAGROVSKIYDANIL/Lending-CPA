import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SectionTransitionEngine } from './section-transition.engine';
import { SECTION_IDS, type Direction, type SectionId } from './section-navigation.types';

interface NavigationOptions {
  readonly updateUrl?: boolean;
  readonly queue?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SectionNavigationService {
  private readonly router = inject(Router);
  private readonly transitionEngine = inject(SectionTransitionEngine);
  private readonly activeSectionState = signal<SectionId>('hero');
  private readonly targetSectionState = signal<SectionId | null>(null);
  private readonly directionState = signal<Direction>('forward');
  private readonly animatingState = signal(false);
  private queuedSection: SectionId | null = null;
  private enabled = false;

  readonly activeSection = this.activeSectionState.asReadonly();
  readonly targetSection = this.targetSectionState.asReadonly();
  readonly direction = this.directionState.asReadonly();
  readonly isAnimating = this.animatingState.asReadonly();
  readonly visibleSections = computed<readonly SectionId[]>(() => {
    const target = this.targetSectionState();
    return target ? [this.activeSectionState(), target] : [this.activeSectionState()];
  });

  async initialize(section: SectionId): Promise<void> {
    this.enabled = true;
    this.transitionEngine.cancel();
    this.activeSectionState.set(section);
    this.targetSectionState.set(null);
    this.directionState.set('forward');
    this.animatingState.set(true);
    const completed = await this.transitionEngine.enter(section, 'forward');
    if (completed) this.animatingState.set(false);
  }

  disable(): void {
    this.enabled = false;
    this.queuedSection = null;
    this.transitionEngine.cancel();
    this.targetSectionState.set(null);
    this.animatingState.set(false);
  }

  next(): void {
    this.navigateByOffset(1);
  }

  previous(): void {
    this.navigateByOffset(-1);
  }

  navigateTo(section: SectionId, options: NavigationOptions = {}): void {
    if (!this.enabled) return;
    if (this.animatingState()) {
      if (options.queue) this.queuedSection = section;
      return;
    }

    const current = this.activeSectionState();
    if (current === section) return;
    const direction: Direction =
      SECTION_IDS.indexOf(section) > SECTION_IDS.indexOf(current) ? 'forward' : 'backward';

    if (options.updateUrl !== false) this.updateUrl(section);
    void this.runTransition(current, section, direction);
  }

  private navigateByOffset(offset: -1 | 1): void {
    if (!this.enabled || this.animatingState()) return;
    const targetIndex = SECTION_IDS.indexOf(this.activeSectionState()) + offset;
    const target = SECTION_IDS[targetIndex];
    if (target) this.navigateTo(target);
  }

  private async runTransition(from: SectionId, to: SectionId, direction: Direction): Promise<void> {
    this.directionState.set(direction);
    this.targetSectionState.set(to);
    this.animatingState.set(true);
    const completed = await this.transitionEngine.transition(from, to, direction);
    if (!completed) return;

    this.activeSectionState.set(to);
    this.targetSectionState.set(null);
    this.animatingState.set(false);

    const queued = this.queuedSection;
    this.queuedSection = null;
    if (queued && queued !== to) this.navigateTo(queued, { updateUrl: false });
  }

  private updateUrl(section: SectionId): void {
    void this.router.navigate([], {
      fragment: section === 'hero' ? undefined : section,
      queryParamsHandling: 'preserve',
    });
  }
}
