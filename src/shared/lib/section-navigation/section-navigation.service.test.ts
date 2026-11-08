import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SectionNavigationService } from './section-navigation.service';
import { SectionTransitionEngine } from './section-transition.engine';

describe('SectionNavigationService', () => {
  it('honors boundaries and updates the section and URL', async () => {
    const engine = jasmine.createSpyObj('engine', ['cancel', 'enter', 'transition']);
    engine.enter.and.resolveTo(true);
    engine.transition.and.resolveTo(true);
    const router = jasmine.createSpyObj('router', ['navigate']);
    TestBed.configureTestingModule({ providers: [{ provide: SectionTransitionEngine, useValue: engine }, { provide: Router, useValue: router }] });
    const service = TestBed.inject(SectionNavigationService);
    service.next();
    expect(engine.transition).not.toHaveBeenCalled();
    await service.initialize('hero');
    service.previous();
    expect(engine.transition).not.toHaveBeenCalled();
    service.next();
    expect(service.targetSection()).toBe('team');
    expect(router.navigate).toHaveBeenCalledWith([], { fragment: 'team', queryParamsHandling: 'preserve' });
    await Promise.resolve();
    expect(service.activeSection()).toBe('team');
    service.disable();
    expect(service.isAnimating()).toBeFalse();
  });
});
