import { HttpErrorResponse } from '@angular/common/http';
// import { translate } from '@shared/lib/i18n';

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

// export function mapHttpError(
//   error: HttpErrorResponse,
//   options: HttpErrorMappingOptions = {},
// ): FallbackError {
//   const code = error.status > 0 ? `HTTP ${error.status}` : undefined;
//
//   if (isAbortError(error.error)) {
//     return {
//       kind: 'cancelled',
//       title: '',
//       message: '',
//       showPopup: false,
//       retryable: false,
//     };
//   }
//
//   if (error.status === 400 || error.status === 422) {
//     return {
//       kind: 'request',
//       title: translate({
//         en: "We couldn't process the request",
//         ru: 'Не удалось обработать запрос',
//       }),
//       message: translate({
//         en: 'Check the entered data and try again.',
//         ru: 'Проверьте введённые данные и попробуйте ещё раз.',
//       }),
//       code,
//       fieldErrors: options.fieldErrors,
//       showPopup: !hasFieldErrors(options.fieldErrors),
//       retryable: false,
//     };
//   }
//
//   if (error.status === 401 || error.status === 403) {
//     return {
//       kind: 'access',
//       title: translate({ en: 'Access denied', ru: 'Доступ запрещён' }),
//       message: translate({
//         en: "You don't have permission to perform this action.",
//         ru: 'У вас нет разрешения на выполнение этого действия.',
//       }),
//       code,
//       showPopup: true,
//       retryable: false,
//     };
//   }
//
//   if (error.status === 404) {
//     return {
//       kind: 'not-found',
//       title: translate({ en: 'Resource not found', ru: 'Ресурс не найден' }),
//       message: translate({
//         en: 'The requested resource is unavailable.',
//         ru: 'Запрошенный ресурс недоступен.',
//       }),
//       code,
//       showPopup: true,
//       retryable: false,
//     };
//   }
//
//   if (error.status === 408 || error.status === 504) {
//     return {
//       kind: 'timeout',
//       title: translate({
//         en: 'The request took too long',
//         ru: 'Запрос занял слишком много времени',
//       }),
//       message: translate({
//         en: "The service didn't respond in time. Please try again.",
//         ru: 'Сервис не ответил вовремя. Попробуйте ещё раз.',
//       }),
//       code,
//       showPopup: true,
//       retryable: true,
//     };
//   }
//
//   if (error.status === 429) {
//     return {
//       kind: 'rate-limit',
//       title: translate({ en: 'Too many requests', ru: 'Слишком много запросов' }),
//       message: translate({
//         en: 'Please wait a little before trying again.',
//         ru: 'Подождите немного перед повторной попыткой.',
//       }),
//       code,
//       retryAfterSeconds: parseRetryAfter(error.headers.get('Retry-After')),
//       showPopup: true,
//       retryable: true,
//     };
//   }
//
//   if (error.status === 500 || error.status === 502 || error.status === 503) {
//     return {
//       kind: 'server',
//       title: translate({
//         en: 'Service temporarily unavailable',
//         ru: 'Сервис временно недоступен',
//       }),
//       message: translate({
//         en: 'Something went wrong on our side. Please try again.',
//         ru: 'На нашей стороне произошла ошибка. Попробуйте ещё раз.',
//       }),
//       code,
//       showPopup: true,
//       retryable: true,
//     };
//   }
//
//   if (error.status === 0) {
//     return {
//       kind: 'network',
//       title: translate({ en: 'Connection problem', ru: 'Проблема с подключением' }),
//       message: translate({
//         en: "We couldn't reach the service. Check your connection and try again.",
//         ru: 'Не удалось связаться с сервисом. Проверьте подключение и попробуйте ещё раз.',
//       }),
//       showPopup: true,
//       retryable: true,
//     };
//   }
//
//   return {
//     kind: 'unknown',
//     title: translate({ en: 'Something went wrong', ru: 'Что-то пошло не так' }),
//     message: translate({
//       en: "We couldn't complete the operation. Please try again later.",
//       ru: 'Не удалось завершить операцию. Попробуйте позже.',
//     }),
//     code,
//     showPopup: true,
//     retryable: false,
//   };
// }
