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
import { ApplicationData, ContactMethod, isValidContact } from '../model/contact-validation';
import { Select } from '@shared/ui/select';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [Select],
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
  readonly contactError = computed(() => {
    if (!this.attempted() && !this.touched()) return '';
    if (!this.contact().trim()) return 'Please enter your contact.';
    const method = this.method();
    if (!method || isValidContact(method, this.contact())) return '';
    switch (method) {
      case 'Email':
        return 'Enter a valid email address, for example name@example.com.';
      case 'Telegram':
        return 'Enter a Telegram username (5–32 characters) or a https://t.me/ link.';
      case 'WhatsApp':
        return 'Enter a phone number with country code, for example +373 60123456.';
    }
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
          placeholder: 'Your Contact*',
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
    this.serverError.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    this.attempted.set(true);
    this.serverError.set('');
    const method = this.method();
    if (!method || this.contactError()) {
      this.dialog()
        .nativeElement.querySelector<HTMLElement>(method ? '[name="contact"]' : '#contact-method')
        ?.focus();
      return;
    }
    this.pending.set(true);
    this.submitted.emit({ name: this.name().trim(), method, contact: this.contact().trim() });
  }

  /** Call only after the API has accepted the application. */
  complete(): void {
    this.pending.set(false);
    this.success.set(true);
  }

  fail(message = 'Unable to send your application. Please try again.'): void {
    this.pending.set(false);
    this.serverError.set(message);
  }

  close(): void {
    this.dialog().nativeElement.close();
    this.closed.emit();
  }
}
