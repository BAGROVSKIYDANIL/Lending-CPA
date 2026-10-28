export interface LocalizedText {
  readonly en: string;
  readonly ru?: string;
  readonly ua?: string;
}

export function translate(text: LocalizedText): string {
  switch (__APP_LOCALE__) {
    case 'ru':
      return text.ru ?? text.en;
    case 'ua':
      return text.ua ?? text.en;
    case 'en-US':
      return text.en;
  }
}
