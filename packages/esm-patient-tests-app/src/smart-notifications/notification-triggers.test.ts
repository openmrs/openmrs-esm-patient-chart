import { describe, expect, it } from 'vitest';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { mockNormalObservation, mockRoutineOrder } from '__mocks__';
import { classifyNotification } from './notification-model';
import { optInCoversOrder } from './opt-in-store';

const notOptedIn = { notifyOnAbnormalNonCritical: false, optedIn: false };

const routineResult = (ranges: object | undefined, value = '5') =>
  ({ ...mockNormalObservation, value, ranges }) as never as typeof mockNormalObservation;

/**
 * The guarantee the whole feature rests on: a routine, in-range, non-opted-in result produces
 * nothing. Every case below reached the bell tagged CRITICAL, because a critical bound the concept
 * never really had was taken at face value.
 */
describe('a routine order files silently even when the concept ranges are junk', () => {
  it.each([
    ['a zero critical bound and no normal range', { hiCritical: 0, units: 'mmol/L' }],
    ['a zero absolute bound and no normal range', { hiAbsolute: 0, units: 'mmol/L' }],
    ['every range field zeroed', { lowNormal: 0, hiNormal: 0, lowCritical: 0, hiCritical: 0, hiAbsolute: 0 }],
    ['a normal band collapsed to a point', { lowNormal: 5, hiNormal: 5, hiCritical: 0 }],
    ['no ranges at all', undefined],
  ])('%s', (_label, ranges) => {
    expect(classifyNotification(mockRoutineOrder as Order, routineResult(ranges), notOptedIn)).toBeNull();
  });

  // The guard must only ever drop a bound it cannot trust. A concept with a real normal band and a
  // real critical threshold must still raise CRITICAL, or the fix is worse than the bug.
  it('still raises CRITICAL when the concept ranges are genuine', () => {
    const obs = routineResult({ lowNormal: 4, hiNormal: 7, lowCritical: 2, hiCritical: 25 }, '30');

    expect(classifyNotification(mockRoutineOrder as Order, obs, notOptedIn)).toBe('CRITICAL');
  });

  // And the lab's own word is still honoured, which is how a concept with no usable dictionary
  // range can still produce a critical.
  it('still raises CRITICAL from a lab-supplied interpretation with no ranges', () => {
    const obs = { ...routineResult(undefined), interpretation: 'CRITICALLY_HIGH' as const };

    expect(classifyNotification(mockRoutineOrder as Order, obs, notOptedIn)).toBe('CRITICAL');
  });
});

/**
 * The opt-in is keyed by patient + concept, so without a time bound ticking it once made every
 * order of that test notify — including ones placed earlier with the toggle off.
 */
describe('an opt-in only covers orders placed around or after it', () => {
  const optedInAt = '2026-06-29T09:00:00.000Z';

  it('covers the order placed with the toggle on', () => {
    expect(optInCoversOrder(optedInAt, '2026-06-29T09:00:05.000Z')).toBe(true);
  });

  it('covers an order the server timestamped just before the opt-in was written', () => {
    // The direct-post path records the choice in the POST's .then(), so this ordering is normal.
    expect(optInCoversOrder(optedInAt, '2026-06-29T08:59:55.000Z')).toBe(true);
  });

  it('does not reach back to an order placed the day before', () => {
    expect(optInCoversOrder(optedInAt, '2026-06-28T09:00:00.000Z')).toBe(false);
  });

  it('does not reach back to an order placed weeks earlier', () => {
    expect(optInCoversOrder(optedInAt, '2026-06-01T09:00:00.000Z')).toBe(false);
  });

  it('is false when there is no opt-in at all', () => {
    expect(optInCoversOrder(undefined, '2026-06-29T09:00:00.000Z')).toBe(false);
  });

  it('honours a legacy boolean opt-in rather than dropping it', () => {
    expect(optInCoversOrder(true, '2026-06-01T09:00:00.000Z')).toBe(true);
  });
});
