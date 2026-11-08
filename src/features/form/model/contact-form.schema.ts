import { z } from 'zod';

export const contactApiMethodSchema = z.enum(['telegram', 'whatsapp', 'email']);

export const contactFormRequestSchema = z
  .object({
    name: z.string().trim().optional(),
    method: contactApiMethodSchema,
    contact: z.string().trim().min(1, { error: 'validation.required' }),
  })
  .superRefine((data, context) => {
    if (data.method === 'email' && !z.email().safeParse(data.contact).success) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'validation.invalidEmail',
      });
    }
  });

export type ContactApiMethod = z.infer<typeof contactApiMethodSchema>;
export type ContactFormRequest = z.infer<typeof contactFormRequestSchema>;
