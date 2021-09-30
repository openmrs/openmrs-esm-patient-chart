import useSWR from 'swr';
import { map } from 'rxjs/operators';
import { openmrsObservableFetch, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { FHIRCondition, FHIRConditionResponse } from '../types';

export function useConditions(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: FHIRConditionResponse }, Error>(
    `${fhirBaseUrl}/Condition?patient=${patientUuid}`,
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
    isLoading: !data && !error,
    isValidating,
  };
}

export function searchConditionConcepts(searchTerm: string) {
  const conditionConceptClassUuid = '8d4918b0-c2cc-11de-8d13-0010c6dffd0f';

  return openmrsObservableFetch<Array<CodedCondition>>(
    `/ws/rest/v1/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${searchTerm}`,
  ).pipe(map(({ data }) => data['results']));
}

export function getConditionByUuid(conditionUuid: string) {
  return openmrsObservableFetch(`${fhirBaseUrl}/Condition/${conditionUuid}`).pipe(
    map(({ data }) => data),
    map((data: FHIRCondition) => mapConditionProperties(data)),
  );
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  return {
    clinicalStatus: condition?.clinicalStatus?.coding[0]?.code,
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

export function updatePatientCondition(patientCondition, patientUuid, abortController) {
  return Promise.resolve({ status: 200, body: 'Ok' });
}

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
};

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
