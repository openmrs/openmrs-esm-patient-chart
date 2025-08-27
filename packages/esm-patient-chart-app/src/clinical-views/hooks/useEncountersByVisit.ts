import React from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Encounter } from '../types';

interface EncounterResponse {
  results: Encounter[]; // TODO: make sure this matches the actual API response
}

export function useEncountersByVisit(patientUuid: string, visitUuid: string) {
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&v=full`; // TODO: remove v=full and specify needed fields
  const { data: response, error, isLoading } = useSWR<{ data: EncounterResponse }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    encounters: response?.data.results.filter((encounter) => encounter.visit?.uuid === visitUuid),
  };
}
