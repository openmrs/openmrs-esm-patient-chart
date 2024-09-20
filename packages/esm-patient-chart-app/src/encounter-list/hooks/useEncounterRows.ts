import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Encounter } from '../types';

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display,age,identifiers,person),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';

interface EncounterResponse {
  results: Encounter[];
  totalCount?: number;
}

export function useEncounterRows(
  patientUuid: string,
  encounterType: string,
  encounterFilter: (encounter) => boolean,
  afterFormSaveAction: () => void,
  pageSize?: number,
  currentPage?: number,
) {
  const startIndex = (currentPage - 1) * pageSize;
  const [encounters, setEncounters] = useState([]);
  const url = `${restBaseUrl}/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}&totalCount=true&limit=${pageSize}&startIndex=${startIndex}`;

  const { data: response, error, isLoading, mutate } = useSWR<{ data: EncounterResponse }, Error>(url, openmrsFetch);

  useEffect(() => {
    if (response) {
      response.data.results.sort(
        (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
      );

      if (encounterFilter) {
        setEncounters(response.data.results.filter((encounter) => encounterFilter(encounter)));
      } else {
        setEncounters([...response.data.results]);
      }
    }
  }, [encounterFilter, response]);

  const onFormSave = useCallback(() => {
    mutate();
    afterFormSaveAction && afterFormSaveAction();
  }, [afterFormSaveAction, mutate]);

  return {
    encounters,
    total: response?.data?.totalCount,
    isLoading,
    error,
    onFormSave,
    mutate,
  };
}
