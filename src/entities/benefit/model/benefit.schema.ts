import { z } from 'zod';

export const benefitsResponseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  benefits: z.array(z.string().min(1)).min(1),
});

export type BenefitsResponse = z.infer<typeof benefitsResponseSchema>;
