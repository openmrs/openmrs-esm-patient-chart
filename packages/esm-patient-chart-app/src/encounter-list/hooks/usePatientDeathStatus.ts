import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr';

export function usePatientDeathStatus(patientUuid: string) {
  const {
    data: response,
    isLoading,
    error,
  } = useSWRImmutable<any, Error>(`${restBaseUrl}/person/${patientUuid}?v=custom:(dead)`, openmrsFetch);

  return {
    isDead: !isLoading && !error && response ? response?.data?.dead : false,
  };
}
