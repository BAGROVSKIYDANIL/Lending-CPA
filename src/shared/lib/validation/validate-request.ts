import { z } from 'zod';
import { RequestValidationError } from './validation-error';

export function validateRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) throw new RequestValidationError(result.error.issues);
  return result.data;
}
