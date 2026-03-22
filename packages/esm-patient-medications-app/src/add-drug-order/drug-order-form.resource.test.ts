import { configSchema } from '../config-schema';
import { durationToDays } from './drug-order-form.resource';

const durationUnitsDaysMap = configSchema.durationUnitsDaysMap._default;

describe('durationToDays', () => {
  it('converts days correctly', () => {
    expect(durationToDays(7, '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBe(7);
  });

  it('converts weeks correctly', () => {
    expect(durationToDays(2, '1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBe(14);
  });

  it('converts months correctly', () => {
    expect(durationToDays(3, '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBe(90);
  });

  it('converts years correctly', () => {
    expect(durationToDays(1, '1734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBe(365);
  });

  it('returns null when duration is null', () => {
    expect(durationToDays(null, '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBeNull();
  });

  it('returns null when duration unit UUID is null', () => {
    expect(durationToDays(7, null, durationUnitsDaysMap)).toBeNull();
  });

  it('returns null for an unknown duration unit UUID', () => {
    expect(durationToDays(7, 'unknown-uuid', durationUnitsDaysMap)).toBeNull();
  });

  it('returns 0 when duration is 0', () => {
    expect(durationToDays(0, '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', durationUnitsDaysMap)).toBe(0);
  });
});
