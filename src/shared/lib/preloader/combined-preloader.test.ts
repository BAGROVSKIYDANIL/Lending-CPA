import { CombinedPreloader } from './combined-preloader';

describe('CombinedPreloader', () => {
  it('tracks independent tasks and releases each task idempotently', () => {
    const loader = new CombinedPreloader();
    const first = loader.begin('api', 'same');
    const second = loader.begin('api', 'same');
    expect(loader.pending().length).toBe(2);
    first();
    first();
    expect(loader.isLoading()).toBeTrue();
    expect(loader.pending().length).toBe(1);
    second();
    expect(loader.isLoading()).toBeFalse();
  });
});
