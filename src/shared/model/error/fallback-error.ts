import { HttpErrorResponse } from '@angular/common/http';

export type ErrorTranslator = (key: string, params?: Record<string, unknown>) => string;

export type FallbackErrorKind =
  | 'request'
  | 'access'
  | 'not-found'
  | 'timeout'
  | 'rate-limit'
  | 'server'
  | 'network'
  | 'unknown'
  | 'cancelled';

export interface FallbackError {
  readonly kind: FallbackErrorKind;
  readonly title: string;
  readonly message: string;
  readonly code?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
  readonly retryAfterSeconds?: number;
  readonly showPopup: boolean;
  readonly retryable: boolean;
}

export interface HttpErrorMappingOptions {
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

const hasFieldErrors = (fieldErrors?: Readonly<Record<string, string>>): boolean =>
  !!fieldErrors && Object.keys(fieldErrors).length > 0;

const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException) return error.name === 'AbortError';
  if (!error || typeof error !== 'object') return false;
  return 'type' in error && error.type === 'abort';
};

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
};

export function mapHttpError(
  error: HttpErrorResponse,
  translate: ErrorTranslator,
  options: HttpErrorMappingOptions = {},
): FallbackError {
  const code = error.status > 0 ? `HTTP ${error.status}` : undefined;

  if (isAbortError(error.error)) {
    return { kind: 'cancelled', title: '', message: '', showPopup: false, retryable: false };
  }

  if (error.status === 400 || error.status === 422) {
    return {
      kind: 'request',
      title: translate('fallback.requestTitle'),
      message: translate('fallback.requestMessage'),
      code,
      fieldErrors: options.fieldErrors,
      showPopup: !hasFieldErrors(options.fieldErrors),
      retryable: false,
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      kind: 'access',
      title: translate('fallback.accessTitle'),
      message: translate('fallback.accessMessage'),
      code,
      showPopup: true,
      retryable: false,
    };
  }

  if (error.status === 404) {
    return {
      kind: 'not-found',
      title: translate('fallback.notFoundTitle'),
      message: translate('fallback.notFoundMessage'),
      code,
      showPopup: true,
      retryable: false,
    };
  }

  if (error.status === 408 || error.status === 504) {
    return {
      kind: 'timeout',
      title: translate('fallback.timeoutTitle'),
      message: translate('fallback.timeoutMessage'),
      code,
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 429) {
    return {
      kind: 'rate-limit',
      title: translate('fallback.rateLimitTitle'),
      message: translate('fallback.rateLimitMessage'),
      code,
      retryAfterSeconds: parseRetryAfter(error.headers.get('Retry-After')),
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 500 || error.status === 502 || error.status === 503) {
    return {
      kind: 'server',
      title: translate('fallback.serverTitle'),
      message: translate('fallback.serverMessage'),
      code,
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 0) {
    return {
      kind: 'network',
      title: translate('fallback.networkTitle'),
      message: translate('fallback.networkMessage'),
      showPopup: true,
      retryable: true,
    };
  }

  return {
    kind: 'unknown',
    title: translate('fallback.unknownTitle'),
    message: translate('fallback.unknownMessage'),
    code,
    showPopup: true,
    retryable: false,
  };
}
