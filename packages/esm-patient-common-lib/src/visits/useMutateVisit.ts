import { restBaseUrl } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr/_internal';
import { unstable_serialize } from 'swr/infinite';
import { useInfiniteVisitsGetKey } from './useInfiniteVisits';

/**
 * This hook provides a function to mutate data fetched by useSWR when querying
 * for visits by a specific patient, or for a visit by its uuid. (This should
 * cover all use cases within the patient chart.) In the unlikely scenarios where we
 * query for visit data in any other way, this mutate function will not work, and
 * a different way to mutate visits is needed.
 */
export function useMutateVisits() {
  const { mutate } = useSWRConfig();
  const getKey = useInfiniteVisitsGetKey();

  return {
    mutateVisits: (patientUuid: string, mutatedVisitUuid?: string) => {
      const mutatePromise = mutate((key) => {
        return (
          typeof key === 'string' &&
          // is it a request for visits of the patient?
          ((key.includes(`${restBaseUrl}/visit`) && key.includes(`patient=${patientUuid}`)) ||
            // is it a request for the particular mutated visit?
            (mutatedVisitUuid && key.includes(`${restBaseUrl}/visit/${mutatedVisitUuid}`)))
        );
      });

      // useSWRInfinite requires a different way to mutate its data
      const mutateInfiniteVisitsPromise = mutate(unstable_serialize(getKey(patientUuid)));

      return Promise.all([mutatePromise, mutateInfiniteVisitsPromise]);
    },
  };
}
