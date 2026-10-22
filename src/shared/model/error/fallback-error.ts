import { HttpErrorResponse } from '@angular/common/http';

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
  /** Field errors must already be validated against the endpoint contract. */
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
  options: HttpErrorMappingOptions = {},
): FallbackError {
  const code = error.status > 0 ? `HTTP ${error.status}` : undefined;

  if (isAbortError(error.error)) {
    return {
      kind: 'cancelled',
      title: '',
      message: '',
      showPopup: false,
      retryable: false,
    };
  }

  if (error.status === 400 || error.status === 422) {
    return {
      kind: 'request',
      title: $localize`:@@fallbackError.request.title:We couldn't process the request`,
      message: $localize`:@@fallbackError.request.message:Check the entered data and try again.`,
      code,
      fieldErrors: options.fieldErrors,
      showPopup: !hasFieldErrors(options.fieldErrors),
      retryable: false,
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      kind: 'access',
      title: $localize`:@@fallbackError.access.title:Access denied`,
      message: $localize`:@@fallbackError.access.message:You don't have permission to perform this action.`,
      code,
      showPopup: true,
      retryable: false,
    };
  }

  if (error.status === 404) {
    return {
      kind: 'not-found',
      title: $localize`:@@fallbackError.notFound.title:Resource not found`,
      message: $localize`:@@fallbackError.notFound.message:The requested resource is unavailable.`,
      code,
      showPopup: true,
      retryable: false,
    };
  }

  if (error.status === 408 || error.status === 504) {
    return {
      kind: 'timeout',
      title: $localize`:@@fallbackError.timeout.title:The request took too long`,
      message: $localize`:@@fallbackError.timeout.message:The service didn't respond in time. Please try again.`,
      code,
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 429) {
    return {
      kind: 'rate-limit',
      title: $localize`:@@fallbackError.rateLimit.title:Too many requests`,
      message: $localize`:@@fallbackError.rateLimit.message:Please wait a little before trying again.`,
      code,
      retryAfterSeconds: parseRetryAfter(error.headers.get('Retry-After')),
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 500 || error.status === 502 || error.status === 503) {
    return {
      kind: 'server',
      title: $localize`:@@fallbackError.server.title:Service temporarily unavailable`,
      message: $localize`:@@fallbackError.server.message:Something went wrong on our side. Please try again.`,
      code,
      showPopup: true,
      retryable: true,
    };
  }

  if (error.status === 0) {
    return {
      kind: 'network',
      title: $localize`:@@fallbackError.network.title:Connection problem`,
      message: $localize`:@@fallbackError.network.message:We couldn't reach the service. Check your connection and try again.`,
      showPopup: true,
      retryable: true,
    };
  }

  return {
    kind: 'unknown',
    title: $localize`:@@fallbackError.unknown.title:Something went wrong`,
    message: $localize`:@@fallbackError.unknown.message:We couldn't complete the operation. Please try again later.`,
    code,
    showPopup: true,
    retryable: false,
  };
}
