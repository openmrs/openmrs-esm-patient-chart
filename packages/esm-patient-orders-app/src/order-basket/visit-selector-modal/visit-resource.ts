import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useVisits(patientUuid: string) {
  const customRepresentation = 'custom:(uuid,display,location,display,startDatetime,stopDatetime)';

  const apiUrl = patientUuid ? `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}` : null;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: localMutate,
  } = useSWR(patientUuid ? ['visits', patientUuid] : null, () => openmrsFetch(apiUrl));

  return {
    visits: data ? data?.data?.results : null,
    error,
    isLoading,
    isValidating,
    mutateVisits: localMutate,
  };
}
