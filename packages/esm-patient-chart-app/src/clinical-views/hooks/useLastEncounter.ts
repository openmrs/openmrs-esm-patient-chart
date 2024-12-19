import { openmrsFetch } from '@openmrs/esm-framework';
import { type Encounter } from '../types';
import useSWRImmutable from 'swr/immutable';

const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display,age,identifiers,person),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,display,name:(uuid,name)),value:(uuid,name:(uuid,name,display),' +
  'names:(uuid,conceptNameType,name,display))),form:(uuid,name))';

export function useLastEncounter(patientUuid: string, encounterType: string) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}&limit=1&order=desc&startIndex=0`;
  const endpointUrl =
    patientUuid && encounterType ? `/ws/rest/v1/encounter?${query}&v=${encounterRepresentation}` : null;

  const { data, error, isLoading, isValidating } = useSWRImmutable<{ data: { results: Array<Encounter> } }, Error>(
    endpointUrl,
    openmrsFetch,
  );

  return {
    lastEncounter: data ? data?.data.results?.length > 0 && data?.data.results[0] : null,
    error,
    isLoading,
    isValidating,
  };
}
