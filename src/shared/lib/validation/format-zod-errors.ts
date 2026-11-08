import type { ZodIssue } from 'zod';

export type ValidationFieldErrors = Readonly<Record<string, string>>;

export function formatZodErrors(issues: readonly ZodIssue[]): ValidationFieldErrors {
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    const key = typeof field === 'string' ? field : '_form';
    fieldErrors[key] ??= issue.message;
  }

  return fieldErrors;
}
