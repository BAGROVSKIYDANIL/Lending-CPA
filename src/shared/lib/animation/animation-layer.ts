import { InjectionToken } from '@angular/core';

export interface AnimationHandle {
  readonly finished: Promise<void>;
  cancel(): void;
}

export interface AnimationRequest {
  readonly name: string;
  readonly target: HTMLElement;
  readonly signal?: AbortSignal;
}

export interface AnimationLayer {
  play(request: AnimationRequest): AnimationHandle;
}

/** No default implementation: no animations run during initialization. */
export const ANIMATION_LAYER = new InjectionToken<AnimationLayer>('ANIMATION_LAYER');
