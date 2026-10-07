import { useMemo } from 'react';
import { type Visit } from '@openmrs/esm-framework';
import { useEncounterPrivileges } from '../privileges';
import { getVisitDateBounds, isActiveVisit, validateEncounterDatetime } from './visit-date-bounds';

/**
 * Whether the user may choose the encounter datetime for encounters of the given visit, and the
 * helpers to validate a chosen datetime against the visit's window.
 *
 * Anyone may backdate within the current active visit; past visits additionally require the
 * `Edit Past Visits` privilege.
 */
export function useEncounterBackdating(visit?: Visit | null) {
  const { canEditPastVisits } = useEncounterPrivileges();
  const active = isActiveVisit(visit);

  return useMemo(
    () => ({
      canBackdate: active || canEditPastVisits,
      isActiveVisit: active,
      /** Bounds are computed against the current time, so call this at validation time rather than caching. */
      getBounds: () => getVisitDateBounds(visit),
      validate: (value: Date | null | undefined) => validateEncounterDatetime(value, getVisitDateBounds(visit), visit),
    }),
    [active, canEditPastVisits, visit],
  );
}
