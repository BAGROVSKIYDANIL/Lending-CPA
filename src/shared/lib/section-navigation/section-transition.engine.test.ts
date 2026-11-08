import { SectionTransitionEngine } from './section-transition.engine';

describe('SectionTransitionEngine', () => {
  it('enters and leaves the appropriate sections', async () => {
    const engine = new SectionTransitionEngine();
    const first = { enter: jasmine.createSpy().and.resolveTo(), leave: jasmine.createSpy().and.resolveTo(), reset: jasmine.createSpy() };
    const second = { enter: jasmine.createSpy().and.resolveTo(), leave: jasmine.createSpy().and.resolveTo(), reset: jasmine.createSpy() };
    engine.register('hero', first);
    engine.register('team', second);
    expect(await engine.transition('hero', 'team', 'forward')).toBeTrue();
    expect(first.leave).toHaveBeenCalledWith('forward');
    expect(second.enter).toHaveBeenCalledWith('forward');
  });
  it('invalidates pending transitions on cancellation', async () => {
    const engine = new SectionTransitionEngine();
    let finish!: () => void;
    const controller = { enter: () => new Promise<void>((resolve) => { finish = resolve; }), leave: async () => {}, reset: jasmine.createSpy() };
    engine.register('hero', controller);
    const result = engine.enter('hero', 'forward');
    engine.cancel();
    finish();
    expect(await result).toBeFalse();
    expect(controller.reset).toHaveBeenCalled();
  });
});
