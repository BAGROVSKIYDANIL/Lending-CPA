import { z } from 'zod';

export const contactMethodSchema = z.enum(['Telegram', 'WhatsApp', 'Email'], {
  error: 'validation.required',
});

const requiredContactSchema = z
  .string({ error: 'validation.required' })
  .trim()
  .min(1, { error: 'validation.required' });

export const applicationDataSchema = z
  .object({
    name: z.string().trim().optional(),
    method: contactMethodSchema,
    contact: requiredContactSchema,
  })
  .superRefine((data, context) => {
    if (data.method === 'Email' && !z.email().safeParse(data.contact).success) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'validation.invalidEmail',
      });
    }
  });

export type ContactMethod = z.infer<typeof contactMethodSchema>;
export type ApplicationData = z.infer<typeof applicationDataSchema>;
