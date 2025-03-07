import { restBaseUrl } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { useInfiniteVisitsGetKey } from './useInfiniteVisits';

/**
 * This hook provides a function to mutate data fetched by useSWR when querying
 * for visits by a specific patient, or for a single visit by its uuid. (This should
 * cover all use cases within the patient chart.) In the unlikely scenarios where we
 * query for visit data in any other way, this mutate function will not work, and
 * a different way to mutate visits is needed.
 */
export function useMutateVisits(patientUuid: string) {
  const { mutate } = useSWRConfig();
  const getKey = useInfiniteVisitsGetKey(patientUuid);

  return {
    /**
     * a function to mutate fetched visits of the patient
     *
     * @param mutatedVisitUuid
     *    The specific visit that has been modified. This param is required unless
     *    the visit is newly created.
     *
     */
    mutateVisits: (mutatedVisitUuid?: string) => {
      const mutatePromise = mutate((key) => {
        console.warn(">>>", key, restBaseUrl, patientUuid, mutatedVisitUuid);
        return (
          typeof key === 'string' &&
          // is it a request for visits of the patient?
          ((key.includes(`${restBaseUrl}/visit`) && key.includes(`patient=${patientUuid}`)) ||
            // is it a request for the particular mutated visit?
            (mutatedVisitUuid && key.includes(`${restBaseUrl}/visit/${mutatedVisitUuid}`)))
        );
      });

      // useSWRInfinite requires a different way to mutate its data
      const mutateInfiniteVisitsPromise = mutate(unstable_serialize(getKey));

      return Promise.all([mutatePromise, mutateInfiniteVisitsPromise]);
    },
  };
}
