import { applicationDataSchema, contactMethodSchema } from '@features/form';

describe('applicationDataSchema', () => {
  it('accepts supported methods only', () => {
    for (const method of ['Telegram', 'WhatsApp', 'Email']) expect(contactMethodSchema.safeParse(method).success).toBeTrue();
    expect(contactMethodSchema.safeParse('other').success).toBeFalse();
  });
  it('trims and validates an email', () => {
    const result = applicationDataSchema.safeParse({ name: ' Jane ', method: 'Email', contact: ' a@example.com ' });
    expect(result.success).toBeTrue();
    if (result.success) expect(result.data).toEqual({ name: 'Jane', method: 'Email', contact: 'a@example.com' });
    expect(applicationDataSchema.safeParse({ method: 'Email', contact: 'a@' }).success).toBeFalse();
  });
  it('requires contact details', () => {
    expect(applicationDataSchema.safeParse({ method: 'Telegram', contact: '  ' }).success).toBeFalse();
    expect(applicationDataSchema.safeParse({ method: 'WhatsApp', contact: '+37360123456' }).success).toBeTrue();
  });
});
