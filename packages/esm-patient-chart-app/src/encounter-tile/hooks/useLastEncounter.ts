import { openmrsFetch } from '@openmrs/esm-framework';
import { type OpenmrsEncounter } from '@openmrs/esm-patient-common-lib';

import useSWR from 'swr';

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display,age,identifiers,person),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';

export function useLastEncounter(patientUuid: string, encounterType: string) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}&limit=1&order=desc&startIndex=0`;
  const endpointUrl = `/ws/rest/v1/encounter?${query}&v=${encounterRepresentation}`;

  const { data, error, isValidating } = useSWR<{ data: { results: Array<OpenmrsEncounter> } }, Error>(
    endpointUrl,
    openmrsFetch,
    { dedupingInterval: 5000, refreshInterval: 0 },
  );

  return {
    lastEncounter: data ? data?.data?.results.shift() : null,
    error,
    isLoading: !data && !error,
    isValidating,
  };
}
