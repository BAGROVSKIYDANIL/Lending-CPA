import { z } from 'zod';
import { ResponseValidationError } from './validation-error';

export function validateResponse<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ResponseValidationError(result.error.issues);
  return result.data;
}
