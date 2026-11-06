export const SECTION_IDS = ['hero', 'team', 'benefits', 'join'] as const;

export type SectionId = (typeof SECTION_IDS)[number];
export type Direction = 'forward' | 'backward';

export interface SectionAnimationController {
  enter(direction: Direction): Promise<void>;
  leave(direction: Direction): Promise<void>;
  reset(): void;
}

export interface SectionAnimationStep {
  readonly selector: string;
  readonly keyframes: readonly Keyframe[];
  readonly options: KeyframeAnimationOptions;
  readonly stagger?: number;
}

export interface SectionAnimationDefinition {
  readonly enter: Readonly<Record<Direction, readonly SectionAnimationStep[]>>;
  readonly leave: Readonly<Record<Direction, readonly SectionAnimationStep[]>>;
}

export function isSectionId(value: string | null | undefined): value is SectionId {
  return SECTION_IDS.includes(value as SectionId);
}
