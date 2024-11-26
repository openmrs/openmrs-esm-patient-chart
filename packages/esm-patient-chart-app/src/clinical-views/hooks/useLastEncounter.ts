import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Encounter } from '../utils/helpers';

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display,age,identifiers,person),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,display,name:(uuid,name)),value:(uuid,name:(uuid,name,display),' +
  'names:(uuid,conceptNameType,name,display))),form:(uuid,name))';

const cache = new Map();

export function useLastEncounter(patientUuid: string, encounterType: string) {
  const query = `encounterType=${encounterType}&patient=${patientUuid}&limit=1&order=desc&startIndex=0`;
  const endpointUrl =
    patientUuid && encounterType ? `/ws/rest/v1/encounter?${query}&v=${encounterRepresentation}` : null;

  const cacheKey = endpointUrl;

  const { data, error, isValidating, isLoading } = useSWR<{ results: Array<Encounter> }, Error>(
    cacheKey,
    async (url) => {
      const cachedData = cache.get(url);
      if (cachedData) {
        return cachedData;
      }
      const response = await openmrsFetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const responseData = await response.json();
      cache.set(url, responseData);
      return responseData;
    },
    {
      dedupingInterval: 50000,
      refreshInterval: 0,
    },
  );

  return {
    lastEncounter: data ? data.results?.length > 0 && data.results[0] : null,
    error,
    isLoading,
    isValidating,
  };
}
