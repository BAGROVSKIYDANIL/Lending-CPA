import {
  Component,
  ElementRef,
  afterEveryRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.html',
  styleUrl: './select.scss',
  host: {
    '(document:click)': 'onOutsideClick($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class Select {
  readonly controlId = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = input('');
  readonly placeholder = input('Select');
  readonly label = input('Select an option');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly valueChange = output<string>();
  readonly expanded = signal(false);
  readonly activeIndex = signal(0);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private search = '';
  private lastSearchAt = 0;

  constructor() {
    effect(() => {
      if (this.disabled()) this.expanded.set(false);
    });
    afterEveryRender(() => {
      if (this.expanded()) {
        this.element.nativeElement
          .querySelector<HTMLElement>('.select__option--active')
          ?.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.expanded()) this.expanded.set(false);
    else this.open();
  }

  choose(index: number): void {
    const option = this.options()[index];
    if (this.disabled() || option === undefined) return;
    this.valueChange.emit(option);
    this.expanded.set(false);
    this.trigger().nativeElement.focus();
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.expanded.set(false);
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null))
      this.expanded.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const count = this.options().length;
    if (event.key === 'Tab') {
      this.expanded.set(false);
      return;
    }
    if (event.key === 'Escape') {
      if (this.expanded()) {
        event.preventDefault();
        event.stopPropagation();
        this.expanded.set(false);
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (!this.expanded()) {
        this.open();
        if (event.key === 'End' || event.key === 'ArrowUp')
          this.activeIndex.set(Math.max(0, count - 1));
        return;
      }
      switch (event.key) {
        case 'ArrowDown':
          this.activeIndex.update((index) => Math.min(index + 1, count - 1));
          break;
        case 'ArrowUp':
          this.activeIndex.update((index) => Math.max(index - 1, 0));
          break;
        case 'Home':
          this.activeIndex.set(0);
          break;
        case 'End':
          this.activeIndex.set(Math.max(0, count - 1));
          break;
        default:
          this.choose(this.activeIndex());
      }
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (!this.expanded()) this.open();
      const now = Date.now();
      this.search = (now - this.lastSearchAt < 700 ? this.search : '') + event.key.toLowerCase();
      this.lastSearchAt = now;
      const index = this.options().findIndex((option) =>
        option.toLowerCase().startsWith(this.search),
      );
      if (index >= 0) this.activeIndex.set(index);
    }
  }

  private open(): void {
    this.activeIndex.set(Math.max(0, this.options().indexOf(this.value())));
    this.search = '';
    this.expanded.set(true);
  }
}
