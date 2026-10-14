export type ContactMethod = 'Telegram' | 'WhatsApp' | 'Email';

export interface ApplicationData {
  name: string;
  method: ContactMethod;
  contact: string;
}

export function isValidContact(method: ContactMethod, contact: string): boolean {
  const value = contact.trim();
  switch (method) {
    case 'Email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'Telegram':
      return (
        /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value) ||
        /^https:\/\/t\.me\/[a-zA-Z][a-zA-Z0-9_]{4,31}\/?$/.test(value)
      );
    case 'WhatsApp':
      return /^\+[\d\s()-]+$/.test(value) && /^[1-9]\d{6,14}$/.test(value.replace(/[^\d]/g, ''));
  }
}
