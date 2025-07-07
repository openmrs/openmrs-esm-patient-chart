import type { KeyedMutator } from 'swr';
import { restBaseUrl } from '@openmrs/esm-framework';

/**
 * Invalidates visit history table data without triggering global visit revalidation cascade.
 *
 * This function provides surgical SWR cache invalidation for visit operations. It targets only
 * the paginated visit data used by the visit history table, avoiding unnecessary revalidation
 * of the 28+ components that use current visit data via the useVisit hook.
 *
 * The implementation uses URL pattern matching to discriminate between:
 * - Current visit keys (includeInactive=false) - these are NOT invalidated
 * - Visit history keys (no includeInactive param, or pagination params) - these ARE invalidated
 *
 * Cache key patterns:
 * - Current visit: /visit?patient=123&v=custom&includeInactive=false
 * - Visit history: /visit?patient=123&v=custom:(uuid,location...)&limit=10&startIndex=0&totalCount=true
 *
 * This approach eliminates the 13+ cascade revalidation requests that were previously triggered
 * by global mutateVisit() calls, reducing network traffic and improving performance.
 *
 * @param mutate - SWR mutate function from useSWRConfig()
 * @param patientUuid - Patient UUID to target visit data for
 *
 * @example
 * ```typescript
 * import { useSWRConfig } from 'swr';
 * import { invalidateVisitHistory } from '@openmrs/esm-patient-common-lib';
 *
 * function MyComponent({ patientUuid }) {
 *   const { mutate } = useSWRConfig();
 *
 *   const handleVisitUpdate = async () => {
 *     // Perform visit operation...
 *     await updateVisit(visitData);
 *
 *     // Invalidate only visit history table, not current visit components
 *     invalidateVisitHistory(mutate, patientUuid);
 *   };
 * }
 * ```
 */
export function invalidateVisitHistory(mutate: KeyedMutator<unknown>, patientUuid: string): void {
  mutate((key) => {
    if (typeof key === 'string' && key.includes(`${restBaseUrl}/visit?patient=${patientUuid}`)) {
      // Current visit keys have includeInactive=false
      const isCurrentVisitKey = key.includes('includeInactive=false');

      // Visit history keys typically have pagination parameters or no includeInactive parameter
      const hasHistoryParams = key.includes('limit=') || key.includes('startIndex=') || key.includes('totalCount=');
      const hasNoIncludeInactive = !key.includes('includeInactive');

      // Invalidate if it's clearly a history key OR if it doesn't have includeInactive=false
      // This ensures we target visit history while preserving current visit cache
      return !isCurrentVisitKey && (hasHistoryParams || hasNoIncludeInactive);
    }
    return false;
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
 * Combination utility that invalidates both visit history and encounter data.
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
  invalidateVisitHistory(mutate, patientUuid);
  invalidatePatientEncounters(mutate, patientUuid);
}
