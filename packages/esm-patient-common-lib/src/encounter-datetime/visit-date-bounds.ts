import { parseDate, type Visit } from '@openmrs/esm-framework';

export type VisitWindow = Pick<Visit, 'startDatetime' | 'stopDatetime'>;

export interface VisitDateBounds {
  min?: Date;
  max: Date;
}

export type EncounterDatetimeError = 'beforeVisitStart' | 'afterVisitEnd' | 'inFuture' | 'invalidTime';

export function isActiveVisit(visit?: VisitWindow | null) {
  return !visit?.stopDatetime;
}

/**
 * The window an encounter of the given visit can be dated in: from the visit start up to
 * the visit end, or up to `now` when the visit is still active.
 */
export function getVisitDateBounds(visit?: VisitWindow | null, now: Date = new Date()): VisitDateBounds {
  return {
    min: visit?.startDatetime ? parseDate(visit.startDatetime as string) : undefined,
    max: visit?.stopDatetime ? parseDate(visit.stopDatetime as string) : now,
  };
}

export function validateEncounterDatetime(
  value: Date | null | undefined,
  bounds: VisitDateBounds,
  visit?: VisitWindow | null,
): EncounterDatetimeError | undefined {
  if (!value) {
    return undefined;
  }
  if (bounds.min && value < bounds.min) {
    return 'beforeVisitStart';
  }
  if (value > bounds.max) {
    return isActiveVisit(visit) ? 'inFuture' : 'afterVisitEnd';
  }
  return undefined;
}

/**
 * The datetime to use for a new encounter, given what the user chose. Encounters of an active visit are left
 * to the server to stamp ("now") unless the user chose a datetime. For a past visit "now" would be outside the
 * visit window, so the encounter is pinned to the visit start, as the order basket and the form engine do.
 */
export function resolveNewEncounterDatetime(chosen: Date | null | undefined, visit?: VisitWindow | null): Date | null {
  if (chosen) {
    return chosen;
  }
  return visit?.stopDatetime && visit?.startDatetime ? parseDate(visit.startDatetime as string) : null;
}
