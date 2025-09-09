import React from 'react';
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

  return {
    isLoading,
    error,
    encounters: response?.data.results.filter((encounter) => encounter.visit?.uuid === visitUuid),
  };
}
