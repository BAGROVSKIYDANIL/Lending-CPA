import type { ZodIssue } from 'zod';
import { formatZodErrors, type ValidationFieldErrors } from './format-zod-errors';

export class RequestValidationError extends Error {
  readonly fieldErrors: ValidationFieldErrors;

  constructor(readonly issues: readonly ZodIssue[]) {
    super('Request validation failed.');
    this.name = 'RequestValidationError';
    this.fieldErrors = formatZodErrors(issues);
  }
}

export class ResponseValidationError extends Error {
  constructor(readonly issues: readonly ZodIssue[]) {
    super('Response validation failed.');
    this.name = 'ResponseValidationError';
  }
}
