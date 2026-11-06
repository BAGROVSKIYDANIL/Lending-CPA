import { ElementRef } from '@angular/core';
import {
  type Direction,
  type SectionAnimationController,
  type SectionAnimationDefinition,
  type SectionAnimationStep,
} from './section-navigation.types';

export class NativeSectionAnimationController implements SectionAnimationController {
  private readonly animations = new Set<Animation>();
  private readonly styledTargets = new Set<HTMLElement>();
  private generation = 0;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly definition: SectionAnimationDefinition,
  ) {}

  enter(direction: Direction): Promise<void> {
    return this.play(this.definition.enter[direction]);
  }

  leave(direction: Direction): Promise<void> {
    return this.play(this.definition.leave[direction]);
  }

  reset(): void {
    this.generation += 1;
    for (const animation of this.animations) animation.cancel();
    this.animations.clear();
    for (const target of this.styledTargets) {
      target.style.removeProperty('opacity');
      target.style.removeProperty('transform');
    }
    this.styledTargets.clear();
  }

  private async play(steps: readonly SectionAnimationStep[]): Promise<void> {
    this.reset();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const generation = this.generation;

    const pending: Promise<void>[] = [];
    const currentAnimations: Animation[] = [];
    for (const step of steps) {
      const targets = this.host.nativeElement.querySelectorAll<HTMLElement>(step.selector);
      targets.forEach((target, index) => {
        const delay = Number(step.options.delay ?? 0) + index * (step.stagger ?? 0);
        const animation = target.animate([...step.keyframes], { ...step.options, delay });
        this.animations.add(animation);
        this.styledTargets.add(target);
        currentAnimations.push(animation);
        pending.push(
          animation.finished.then(
            () => undefined,
            () => undefined,
          ),
        );
      });
    }

    await Promise.all(pending);
    if (generation !== this.generation) return;

    for (const animation of currentAnimations) {
      try {
        animation.commitStyles();
      } catch {
        this.animations.delete(animation);
      }
      animation.cancel();
      this.animations.delete(animation);
    }
  }
}
