import { type FetchResponse, OpenmrsResource, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Results } from './types';

interface EncounterResponse {
  results: Array<Results>;
}

export function useProcedures(patientUuid: string, encounterTypeUuid: string) {
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${encounterTypeUuid}&v=custom:(uuid,display,encounterDatetime,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime))`;

  const { data, error, isLoading } = useSWRImmutable<FetchResponse<EncounterResponse>, Error>(url, openmrsFetch);

  const procedures =
    data?.data.results?.map((encounter) => ({
      id: encounter.obs.find((ob) => ob.uuid).uuid,
      procedure: encounter.obs.find((ob) => ob.concept.uuid == '1651AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')?.value?.display,
      year: encounter.obs.find((ob) => ob.concept.uuid == '160715AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')?.value,
    })) ?? [];
  return {
    procedures,
    isLoading,
    error,
  };
}
