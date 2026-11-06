import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { Header } from '@widgets/header/header';
import { Socials } from '@shared/ui/socials/socials';
import { ViewportService } from '@shared/services/viewport.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Preloader } from '@shared/ui/preloader';
import {
  NativeSectionAnimationController,
  type SectionAnimationDefinition,
} from '@shared/lib/section-navigation';

const heroEnter = [
  {
    selector: '.hero',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 300, easing: 'ease-out', fill: 'both' as const },
  },
  {
    selector: '.hero__header',
    keyframes: [
      { opacity: 0, transform: 'translateY(-30px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 360, easing: 'ease-out', fill: 'both' as const },
  },
  {
    selector: '.hero__wrapper',
    keyframes: [{ transform: 'translateX(-110%)' }, { transform: 'translateX(0)' }],
    options: { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
  {
    selector: '.hero__socials',
    keyframes: [{ transform: 'translateY(160%)' }, { transform: 'translateY(0)' }],
    options: { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' as const },
  },
] as const;

const heroLeave = [
  {
    selector: '.hero',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 180, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.hero__header',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-30px)' },
    ],
    options: { duration: 300, easing: 'ease-in', fill: 'both' as const },
  },
  {
    selector: '.hero__wrapper',
    keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-110%)' }],
    options: { duration: 540, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'both' as const },
  },
  {
    selector: '.hero__socials',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(160%)' }],
    options: { duration: 420, easing: 'ease-in', fill: 'both' as const },
  },
] as const;

const heroAnimation: SectionAnimationDefinition = {
  enter: { forward: heroEnter, backward: heroEnter },
  leave: { forward: heroLeave, backward: heroLeave },
};

@Component({
  imports: [Header, Socials, TranslatePipe, Preloader],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly viewport = inject(ViewportService);
  readonly isPreloading = signal(true);
  readonly animationController = new NativeSectionAnimationController(this.host, heroAnimation);

  completePreloading(): void {
    this.isPreloading.set(false);
  }
}
