import { z } from 'zod';

export const multiplyStepsSchema = z.object({
  step_1: z.string().min(1),
  step_2: z.string().min(1),
});

export const multiplyItemSchema = z.object({
  title: z.string().min(1),
  steps: multiplyStepsSchema,
});

export const multiplyResponseSchema = z.array(multiplyItemSchema).min(3);

export type MultiplySteps = z.infer<typeof multiplyStepsSchema>;
export type MultiplyItem = z.infer<typeof multiplyItemSchema>;
export type MultiplyResponse = z.infer<typeof multiplyResponseSchema>;
