import { describe, expect, it } from 'vitest';
import {
  getVisitDateBounds,
  isActiveVisit,
  resolveNewEncounterDatetime,
  validateEncounterDatetime,
} from './visit-date-bounds';

const now = new Date('2026-06-10T12:00:00.000Z');
const activeVisit = { startDatetime: '2026-06-09T08:00:00.000+0000', stopDatetime: null };
const pastVisit = { startDatetime: '2026-06-01T08:00:00.000+0000', stopDatetime: '2026-06-03T17:00:00.000+0000' };

describe('getVisitDateBounds', () => {
  it('uses now as the upper bound of an active visit', () => {
    const bounds = getVisitDateBounds(activeVisit, now);
    expect(bounds.min).toEqual(new Date('2026-06-09T08:00:00.000Z'));
    expect(bounds.max).toEqual(now);
  });

  it('uses the visit stop datetime as the upper bound of a past visit', () => {
    expect(getVisitDateBounds(pastVisit, now).max).toEqual(new Date('2026-06-03T17:00:00.000Z'));
  });

  it('has no lower bound without a visit', () => {
    expect(getVisitDateBounds(undefined, now)).toEqual({ min: undefined, max: now });
  });
});

describe('validateEncounterDatetime', () => {
  it('accepts values on the boundaries', () => {
    const bounds = getVisitDateBounds(pastVisit, now);
    expect(validateEncounterDatetime(bounds.min, bounds, pastVisit)).toBeUndefined();
    expect(validateEncounterDatetime(bounds.max, bounds, pastVisit)).toBeUndefined();
  });

  it('rejects values before the visit start', () => {
    const bounds = getVisitDateBounds(activeVisit, now);
    expect(validateEncounterDatetime(new Date('2026-06-09T07:59:00.000Z'), bounds, activeVisit)).toBe(
      'beforeVisitStart',
    );
  });

  it('rejects future values in an active visit', () => {
    const bounds = getVisitDateBounds(activeVisit, now);
    expect(validateEncounterDatetime(new Date('2026-06-10T12:01:00.000Z'), bounds, activeVisit)).toBe('inFuture');
  });

  it('rejects values after the end of a past visit', () => {
    const bounds = getVisitDateBounds(pastVisit, now);
    expect(validateEncounterDatetime(new Date('2026-06-03T17:01:00.000Z'), bounds, pastVisit)).toBe('afterVisitEnd');
  });

  it('treats an empty value ("now") as valid', () => {
    expect(validateEncounterDatetime(null, getVisitDateBounds(pastVisit, now), pastVisit)).toBeUndefined();
  });
});

describe('resolveNewEncounterDatetime', () => {
  it('keeps the datetime chosen by the user', () => {
    const chosen = new Date('2026-06-02T10:00:00.000Z');
    expect(resolveNewEncounterDatetime(chosen, pastVisit)).toBe(chosen);
  });

  it('leaves the datetime to the server in an active visit', () => {
    expect(resolveNewEncounterDatetime(null, activeVisit)).toBeNull();
    expect(resolveNewEncounterDatetime(null, undefined)).toBeNull();
  });

  it('pins the encounter to the visit start in a past visit', () => {
    expect(resolveNewEncounterDatetime(null, pastVisit)).toEqual(new Date('2026-06-01T08:00:00.000Z'));
  });
});

describe('isActiveVisit', () => {
  it('is true when the visit has no stop datetime', () => {
    expect(isActiveVisit(activeVisit)).toBe(true);
    expect(isActiveVisit(pastVisit)).toBe(false);
  });
});
