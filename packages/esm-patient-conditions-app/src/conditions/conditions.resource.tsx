import useSWR from 'swr';
import { map } from 'rxjs/operators';
import { openmrsObservableFetch, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { FHIRCondition, FHIRConditionResponse } from '../types';

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
};

export interface ConditionDataTableRow {
  cells: Array<{
    id: string;
    value: string;
    info: {
      headers: string;
    };
  }>;
  id: string;
}

export type CodedCondition = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

export function useConditions(patientUuid: string) {
  const conditionsUrl = `${fhirBaseUrl}/Condition?patient=${patientUuid}&_count=100`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRConditionResponse }, Error>(
    patientUuid ? conditionsUrl : null,
    openmrsFetch,
  );

  const formattedConditions =
    data?.data?.total > 0
      ? data?.data?.entry
          .map((entry) => entry.resource ?? [])
          .map(mapConditionProperties)
          .sort((a, b) => (b.onsetDateTime > a.onsetDateTime ? 1 : -1))
      : null;

  return {
    data: data ? formattedConditions : null,
    isError: error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;

  const conditionsSearchUrl = `/ws/rest/v1/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${conditionToLookup}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  return {
    conditions: data?.data?.results ?? [],
    error: error,
    isSearchingConditions: isLoading,
  };
}

export function getConditionByUuid(conditionUuid: string) {
  return openmrsObservableFetch(`${fhirBaseUrl}/Condition/${conditionUuid}`).pipe(
    map(({ data }) => data),
    map((data: FHIRCondition) => mapConditionProperties(data)),
  );
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  const status = condition?.clinicalStatus?.coding[0]?.code;
  return {
    clinicalStatus: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '',
    conceptId: condition?.code?.coding[0]?.code,
    display: condition?.code?.coding[0]?.display,
    onsetDateTime: condition?.onsetDateTime,
    recordedDate: condition?.recordedDate,
    id: condition?.id,
  };
}

export function createPatientCondition(payload, abortController) {
  return openmrsObservableFetch(`${fhirBaseUrl}/Condition`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController,
  });
}

export function editPatientCondition(conditionId, payload, abortController) {
  return openmrsObservableFetch(`${fhirBaseUrl}/Condition/${conditionId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: payload,
    signal: abortController,
  });
}

export function deletePatientCondition(conditionUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/Condition/${conditionUuid}`, {
    method: 'DELETE',
  });
}
