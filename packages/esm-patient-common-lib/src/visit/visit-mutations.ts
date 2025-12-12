import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useVisit, type Visit, restBaseUrl } from '@openmrs/esm-framework';
import { usePatientChartStore } from '../store/patient-chart-store';

export interface VisitMutationOptions {
  encounters?: boolean;
  notes?: boolean;
  orders?: boolean;
  observations?: boolean;
}

/**
 * Hook providing optimistic update utilities for visit-related data.
 * This hook helps reduce the number of network requests by updating SWR caches directly
 * instead of triggering full revalidations across all visit-related hooks.
 *
 * @param patientUuid The UUID of the patient
 * @returns Object containing optimistic update functions
 */
export function useOptimisticVisitMutations(patientUuid: string) {
  const { mutate } = useSWRConfig();
  const { visitContext, mutateVisitContext } = usePatientChartStore(patientUuid);

  /**
   * Optimistically updates visit data in SWR caches without triggering network requests.
   * Updates both the current visit cache and visit list caches.
   */
  const updateVisitOptimistically = useCallback(
    (visitUuid: string, updates: Partial<Visit>) => {
      // Update current visit SWR cache if it matches
      if (visitContext?.uuid === visitUuid) {
        mutateVisitContext?.();
      }

      // Update visit lists across all hooks using regex pattern matching
      const visitListPattern = new RegExp(`${restBaseUrl}/visit\\?patient=${patientUuid}`);

      mutate(
        visitListPattern,
        (current: any) => {
          if (!current?.data?.results) return current;
          return {
            ...current,
            data: {
              ...current.data,
              results: current.data.results.map((visit: Visit) =>
                visit.uuid === visitUuid ? { ...visit, ...updates } : visit,
              ),
            },
          };
        },
        false, // Don't revalidate
      );
    },
    [visitContext, mutateVisitContext, mutate, patientUuid],
  );

  /**
   * Optimistically removes a visit from SWR caches without triggering network requests.
   * Removes from visit lists and revalidates current visit if the deleted visit was current.
   */
  const removeVisitOptimistically = useCallback(
    (visitUuid: string) => {
      // Remove from all visit list caches
      const visitListPattern = new RegExp(`${restBaseUrl}/visit\\?patient=${patientUuid}`);

      mutate(
        visitListPattern,
        (current: any) => {
          if (!current?.data?.results) return current;
          return {
            ...current,
            data: {
              ...current.data,
              results: current.data.results.filter((visit: Visit) => visit.uuid !== visitUuid),
            },
          };
        },
        false, // Don't revalidate
      );

      // If deleted visit was current, revalidate current visit to get new state
      if (visitContext?.uuid === visitUuid) {
        mutateVisitContext?.();
      }
    },
    [visitContext, mutateVisitContext, mutate, patientUuid],
  );

  /**
   * Optimistically adds a new visit to SWR caches without triggering network requests.
   * Adds to visit lists and updates current visit cache if appropriate.
   */
  const addVisitOptimistically = useCallback(
    (newVisit: Visit) => {
      // Add to visit list caches
      const visitListPattern = new RegExp(`${restBaseUrl}/visit\\?patient=${patientUuid}`);

      mutate(
        visitListPattern,
        (current: any) => {
          if (!current?.data?.results) return current;
          return {
            ...current,
            data: {
              ...current.data,
              results: [newVisit, ...current.data.results],
            },
          };
        },
        false, // Don't revalidate
      );

      // If this is an active visit (no stopDatetime), update current visit cache
      if (!newVisit.stopDatetime) {
        mutate(
          `${restBaseUrl}/visit?patient=${patientUuid}&v=custom`,
          (current: any) => ({
            ...current,
            data: newVisit,
          }),
          false, // Don't revalidate
        );
      }
    },
    [mutate, patientUuid],
  );

  /**
   * Selectively invalidates only specific visit-related data that cannot be optimistically updated.
   * This replaces the global mutateVisit() pattern with targeted revalidation.
   */
  const invalidateVisitRelatedData = useCallback(
    (options: VisitMutationOptions = {}) => {
      const promises = [];

      if (options.encounters) {
        promises.push(mutate(new RegExp(`${restBaseUrl}/encounter\\?patient=${patientUuid}`)));
      }
      if (options.notes) {
        promises.push(mutate(new RegExp(`${restBaseUrl}/encounter\\?patient=${patientUuid}.*obs=`)));
      }
      if (options.orders) {
        promises.push(mutate(new RegExp(`${restBaseUrl}/order\\?patient=${patientUuid}`)));
      }
      if (options.observations) {
        promises.push(mutate(new RegExp(`${restBaseUrl}/obs\\?patient=${patientUuid}`)));
      }

      return Promise.all(promises);
    },
    [mutate, patientUuid],
  );

  /**
   * Revalidates only the current visit data with a single targeted request.
   * This confirms the optimistic update with fresh server data.
   */
  const revalidateCurrentVisit = useCallback(() => {
    // Single revalidation request for current visit only
    return mutate(`${restBaseUrl}/visit?patient=${patientUuid}&v=custom`);
  }, [mutate, patientUuid]);

  /**
   * Fallback function that triggers full revalidation when optimistic updates fail.
   * This ensures data consistency when errors occur.
   */
  const revalidateAllVisitData = useCallback(() => {
    // Revalidate current visit
    mutate(`${restBaseUrl}/visit?patient=${patientUuid}&v=custom`);

    // Revalidate visit lists
    mutate(new RegExp(`${restBaseUrl}/visit\\?patient=${patientUuid}`));

    // Revalidate related data
    return invalidateVisitRelatedData({
      encounters: true,
      notes: true,
      orders: true,
      observations: true,
    });
  }, [mutate, patientUuid, invalidateVisitRelatedData]);

  return {
    addVisitOptimistically,
    invalidateVisitRelatedData,
    removeVisitOptimistically,
    revalidateAllVisitData,
    revalidateCurrentVisit,
    updateVisitOptimistically,
  };
}
