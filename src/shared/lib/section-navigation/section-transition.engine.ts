import { Injectable } from '@angular/core';
import {
  type Direction,
  type SectionAnimationController,
  type SectionId,
} from './section-navigation.types';

@Injectable({ providedIn: 'root' })
export class SectionTransitionEngine {
  private readonly controllers = new Map<SectionId, SectionAnimationController>();
  private generation = 0;

  register(section: SectionId, controller: SectionAnimationController): void {
    this.controllers.set(section, controller);
  }

  unregister(section: SectionId, controller: SectionAnimationController): void {
    if (this.controllers.get(section) === controller) this.controllers.delete(section);
  }

  async enter(section: SectionId, direction: Direction): Promise<boolean> {
    const generation = ++this.generation;
    await this.controllers.get(section)?.enter(direction);
    return generation === this.generation;
  }

  async transition(from: SectionId, to: SectionId, direction: Direction): Promise<boolean> {
    const generation = ++this.generation;
    await Promise.all([
      this.controllers.get(from)?.leave(direction),
      this.controllers.get(to)?.enter(direction),
    ]);
    return generation === this.generation;
  }

  cancel(): void {
    this.generation += 1;
    for (const controller of this.controllers.values()) controller.reset();
  }
}
