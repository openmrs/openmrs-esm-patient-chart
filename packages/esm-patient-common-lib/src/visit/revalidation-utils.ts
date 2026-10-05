import type { KeyedMutator } from 'swr';
import { restBaseUrl } from '@openmrs/esm-framework';

/**
 * Invalidates all visit data for a patient: active and past visit lists (e.g. `useVisit`, the visit
 * history table) as well as individual visits fetched by UUID (e.g. the visit context).
 *
 * Cache key patterns:
 * - Active visit: /visit?patient=123&v=custom&includeInactive=false
 * - Visit history: /visit?patient=123&v=custom:(uuid,location...)&limit=10&startIndex=0&totalCount=true
 * - Visit by UUID: /visit/<visit-uuid>?v=custom:(uuid,...)
 *
 * Visit-by-UUID keys do not carry the patient UUID, so all of them are invalidated.
 *
 * @param mutate - SWR mutate function from useSWRConfig()
 * @param patientUuid - Patient UUID to target visit data for
 */
export function invalidateVisits(mutate: KeyedMutator<unknown>, patientUuid: string): void {
  mutate((key) => {
    return (
      typeof key === 'string' &&
      (key.includes(`${restBaseUrl}/visit?patient=${patientUuid}`) || key.includes(`${restBaseUrl}/visit/`))
    );
  });
}

/**
 * Invalidates visit-related encounter data for a specific patient.
 *
 * This function is useful when operations create or modify encounters within visits,
 * requiring the encounter lists and related data to be refreshed.
 *
 * @param mutate - SWR mutate function from useSWRConfig()
 * @param patientUuid - Patient UUID to target encounter data for
 *
 * @example
 * ```typescript
 * // After creating a visit note (which creates an encounter)
 * invalidatePatientEncounters(mutate, patientUuid);
 * ```
 */
export function invalidatePatientEncounters(mutate: KeyedMutator<unknown>, patientUuid: string): void {
  mutate((key) => {
    return (
      typeof key === 'string' && key.includes(`${restBaseUrl}/encounter`) && key.includes(`patient=${patientUuid}`)
    );
  });
}

/**
 * Combination utility that invalidates both visit (active and past) and encounter data.
 *
 * This is commonly needed when operations affect both visit structure and encounter content,
 * such as form submissions, visit note creation, or encounter deletion.
 *
 * @param mutate - SWR mutate function from useSWRConfig()
 * @param patientUuid - Patient UUID to target data for
 *
 * @example
 * ```typescript
 * // After form submission that creates encounters within a visit
 * invalidateVisitAndEncounterData(mutate, patientUuid);
 * ```
 */
export function invalidateVisitAndEncounterData(mutate: KeyedMutator<unknown>, patientUuid: string): void {
  invalidateVisits(mutate, patientUuid);
  invalidatePatientEncounters(mutate, patientUuid);
}
