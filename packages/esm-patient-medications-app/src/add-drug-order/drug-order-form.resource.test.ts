import { configSchema } from '../config-schema';
import { durationToDays, getStartDateMinimum } from './drug-order-form.resource';

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

describe('getStartDateMinimum', () => {
  const visitStart = '2026-05-04T06:33:00.000+0000';
  const previousActivation = '2026-05-05T08:00:00.000+0000';

  it('returns previous activation + 1s for REVISE when previousOrderDateActivated is set', () => {
    const result = getStartDateMinimum('REVISE', previousActivation, visitStart);
    const previousMillis = new Date(previousActivation).getTime();
    expect(result?.getTime()).toBe(previousMillis + 1000);
  });

  it('falls back to the visit start for REVISE when previousOrderDateActivated is missing', () => {
    const result = getStartDateMinimum('REVISE', undefined, visitStart);
    expect(result?.toISOString()).toBe(new Date(visitStart).toISOString());
  });

  it.each(['NEW', 'RENEW', 'DISCONTINUE'] as const)(
    'returns the visit start for %s, ignoring previousOrderDateActivated',
    (action) => {
      const result = getStartDateMinimum(action, previousActivation, visitStart);
      expect(result?.toISOString()).toBe(new Date(visitStart).toISOString());
    },
  );

  it('returns undefined when no visit start is provided and the action is not REVISE', () => {
    expect(getStartDateMinimum('NEW', undefined, undefined)).toBeUndefined();
  });

  it('returns undefined when called with no arguments', () => {
    expect(getStartDateMinimum(undefined, undefined, undefined)).toBeUndefined();
  });
});
