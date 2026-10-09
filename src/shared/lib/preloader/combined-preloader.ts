import { computed, Injectable, signal } from '@angular/core';

export type LoadingSource = 'application' | 'assets' | 'api' | 'animation';

export interface LoadingTask {
  readonly source: LoadingSource;
  readonly label: string;
}

/** Aggregates independent loading sources; contains no visual presentation. */
@Injectable({ providedIn: 'root' })
export class CombinedPreloader {
  private readonly tasks = signal<ReadonlyMap<symbol, LoadingTask>>(new Map());
  readonly pending = computed(() => [...this.tasks().values()]);
  readonly isLoading = computed(() => this.tasks().size > 0);

  /** Each registration has its own identity; the returned release is idempotent. */
  begin(source: LoadingSource, label: string): () => void {
    const id = Symbol(label);
    this.tasks.update((tasks) => new Map(tasks).set(id, { source, label }));
    return () => {
      if (!this.tasks().has(id)) return;
      this.tasks.update((tasks) => {
        const next = new Map(tasks);
        next.delete(id);
        return next;
      });
    };
  }
}
