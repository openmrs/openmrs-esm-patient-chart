import { restBaseUrl, type Privilege } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export interface EncounterType {
  uuid: string;
  editPrivilege?: Privilege;
}

export interface UseEncountersResult {
  encounterTypes: Array<EncounterType>;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<any>;
}

export function useEncounterTypes() {
  const customRep = 'custom:(uuid,editPrivilege)';
  const url = new URL(`${restBaseUrl}/encountertype`, window.location.toString());
  url.searchParams.set('v', customRep);

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<
    { data: { results: Array<EncounterType> } },
    Error
  >(`${restBaseUrl}/encountertype?v=${customRep}`);

  return {
    encounterTypes: data?.data?.results || [],
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}
