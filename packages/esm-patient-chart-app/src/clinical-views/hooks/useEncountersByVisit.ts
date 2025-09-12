import React, { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface EncounterProvider {
  provider: {
    display: string;
  };
}

interface EncounterType {
  name: string;
}

interface Visit {
  uuid: string;
}

export interface Encounter {
  uuid: string;
  encounterType: EncounterType;
  encounterProviders: EncounterProvider[];
  encounterDatetime: string;
  visit: Visit;
}

interface EncounterResponse {
  results: Encounter[];
}

export function useEncountersByVisit(patientUuid: string, visitUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounterType:(name),encounterProviders:(provider:(display)),encounterDatetime,visit:(uuid))';
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&v=${customRepresentation}`;
  const { data: response, error, isLoading } = useSWR<{ data: EncounterResponse }, Error>(url, openmrsFetch);

  const sortedEncounters = useMemo(() => {
    if (!response?.data.results) return [];

    return response.data.results
      .filter((encounter) => encounter.visit?.uuid === visitUuid)
      .sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
  }, [response?.data.results, visitUuid]);

  return {
    isLoading,
    error,
    encounters: sortedEncounters,
  };
}
