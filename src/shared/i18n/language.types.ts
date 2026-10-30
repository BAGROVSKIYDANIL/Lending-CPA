export const LANGUAGES = ['en', 'ru', 'uk'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: string): value is Language {
    return LANGUAGES.some(lang => lang === value);
}