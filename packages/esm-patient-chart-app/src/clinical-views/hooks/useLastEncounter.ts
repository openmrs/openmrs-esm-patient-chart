import { openmrsFetch } from '@openmrs/esm-framework';
import { type Encounter } from '../types';
import useSWR from 'swr';

const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display,age,identifiers,person),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,display,name:(uuid,name)),value:(uuid,name:(uuid,name,display),' +
  'names:(uuid,conceptNameType,name,display))),form:(uuid,name))';

export function useLastEncounter(patientUuid: string, encounterType: string) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}`;
  const endpointUrl =
    patientUuid && encounterType
      ? `/ws/rest/v1/encounter?${query}&v=${encounterRepresentation}&limit=1&order=desc&startIndex=0`
      : null;

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Encounter> } }, Error>(
    endpointUrl,
    openmrsFetch,
  );

  return {
    lastEncounter: data?.data.results?.length > 0 ? data?.data.results[0] : null,
    error,
    isLoading,
    isValidating,
  };
}
