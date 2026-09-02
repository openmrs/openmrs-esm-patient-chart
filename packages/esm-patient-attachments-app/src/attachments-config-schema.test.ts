import { expect, it } from 'vitest';
import { attachmentsConfigSchema } from './attachments-config-schema';

it('defaults maxFileSize to 10MB', () => {
  expect(attachmentsConfigSchema.maxFileSize._default).toBe(10);
});

it('still requires maxFileSize to be greater than zero', () => {
  const [validate] = attachmentsConfigSchema.maxFileSize._validators;

  expect(validate(5)).toBeUndefined();
  expect(validate(0)).toBe('Must be greater than zero');
  expect(validate(-1)).toBe('Must be greater than zero');
});
