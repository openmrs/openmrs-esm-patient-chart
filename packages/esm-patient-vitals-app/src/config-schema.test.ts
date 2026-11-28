import { describe, expect, it } from 'vitest';
import { configSchema } from './config-schema';

describe('vitals.clinicianEncounterRole', () => {
  const [isValid] = configSchema.vitals.clinicianEncounterRole._validators;

  it('accepts an encounter role UUID or an empty value', () => {
    expect(isValid('240b26f9-dd88-4172-823d-4a8bfeb7841f')).toBeUndefined();
    expect(isValid('')).toBeUndefined();
  });

  it('rejects anything else', () => {
    expect(isValid('clinician')).toBe('Must be an encounter role UUID, or empty');
    expect(isValid(null)).toBe('Must be an encounter role UUID, or empty');
  });
});
