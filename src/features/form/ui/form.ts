import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  applicationDataSchema,
  type ApplicationData,
  type ContactMethod,
} from '../model/contact-validation';
import { Select } from '@shared/ui/select';
import { formatZodErrors, type ValidationFieldErrors } from '@shared/lib/validation';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [Select, TranslatePipe],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class ApplicationForm implements AfterViewInit, OnDestroy {
  readonly submitted = output<ApplicationData>();
  readonly closed = output<void>();
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly methods: ContactMethod[] = ['Telegram', 'WhatsApp', 'Email'];
  readonly name = signal('');
  readonly method = signal<ContactMethod | ''>('');
  readonly contact = signal('');
  readonly attempted = signal(false);
  readonly touched = signal(false);
  readonly pending = signal(false);
  readonly success = signal(false);
  readonly serverError = signal('');
  readonly validationErrors = signal<ValidationFieldErrors>({});
  readonly methodError = computed(() => {
    if (!this.attempted()) return '';
    return this.validationErrors()['method'] ?? '';
  });
  readonly contactError = computed(() => {
    if (!this.attempted() && !this.touched()) return '';
    return this.validationErrors()['contact'] ?? '';
  });
  readonly contactInputConfig = computed(() => {
    switch (this.method()) {
      case 'Email':
        return {
          type: 'email',
          autocomplete: 'email',
          placeholder: 'name@example.com',
        };
      case 'WhatsApp':
        return {
          type: 'tel',
          autocomplete: 'tel',
          placeholder: '+373 60123456',
        };
      case 'Telegram':
        return {
          type: 'text',
          autocomplete: 'off',
          placeholder: '@username',
        };
      default:
        return {
          type: 'text',
          autocomplete: 'off',
          placeholder: 'contact',
        };
    }
  });
  private previousOverflow = '';

  ngAfterViewInit(): void {
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog().nativeElement.showModal();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousOverflow;
  }

  selectMethod(value: string): void {
    if (this.methods.includes(value as ContactMethod)) this.method.set(value as ContactMethod);
    else this.method.set('');
    this.clearValidationError('method');
    this.clearValidationError('contact');
    this.serverError.set('');
    if (this.touched()) this.validateContact();
  }

  updateName(value: string): void {
    this.name.set(value);
    this.clearValidationError('name');
    this.serverError.set('');
  }

  updateContact(value: string): void {
    this.contact.set(value);
    this.clearValidationError('contact');
    this.serverError.set('');
  }

  touchContact(): void {
    this.touched.set(true);
    this.validateContact();
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    this.attempted.set(true);
    this.serverError.set('');
    const result = applicationDataSchema.safeParse({
      name: this.name(),
      method: this.method(),
      contact: this.contact(),
    });

    if (!result.success) {
      this.applyValidationErrors(formatZodErrors(result.error.issues));
      return;
    }

    this.validationErrors.set({});
    this.pending.set(true);
    this.submitted.emit(result.data);
  }

  complete(): void {
    this.pending.set(false);
    this.success.set(true);
  }

  fail(message = 'validation.requestFailed'): void {
    this.pending.set(false);
    this.serverError.set(message);
  }

  applyValidationErrors(errors: ValidationFieldErrors): void {
    this.pending.set(false);
    this.attempted.set(true);
    this.validationErrors.set(errors);
    this.focusFirstInvalidField();
  }

  close(): void {
    this.dialog().nativeElement.close();
    this.closed.emit();
  }

  private validateContact(): void {
    const result = applicationDataSchema.safeParse({
      name: this.name(),
      method: this.method(),
      contact: this.contact(),
    });
    const contactError = result.success
      ? undefined
      : formatZodErrors(result.error.issues)['contact'];

    this.validationErrors.update((errors) => {
      const next = { ...errors };
      if (contactError) next['contact'] = contactError;
      else delete next['contact'];
      return next;
    });
  }

  private clearValidationError(field: string): void {
    this.validationErrors.update((errors) => {
      if (!(field in errors)) return errors;
      const next = { ...errors };
      delete next[field];
      return next;
    });
  }

  private focusFirstInvalidField(): void {
    const errors = this.validationErrors();
    const selector = errors['method']
      ? '#contact-method'
      : errors['contact']
        ? '[name="contact"]'
        : null;
    if (selector) this.dialog().nativeElement.querySelector<HTMLElement>(selector)?.focus();
  }
}
