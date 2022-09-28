import { openmrsFetch, showToast, toOmrsIsoString, toDateObjectStrict, showNotification } from '@openmrs/esm-framework';
import { Observable } from 'rxjs';
import { openmrsObservableFetch } from '@openmrs/esm-api';
import useSWR from 'swr';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

interface PersonFetchResponse {
  person: { uuid: string; dead: boolean; deathDate: Date; type: string };
}

interface CauseOfDeathFetchResponse {
  uuid: string;
  value: string;
}

interface ConcentAnswersResponse {
  answers: Array<{
    uuid: string;
    name: string;
    display: string;
  }>;
}

export function usePatientDeceased(patientUuid: string) {
  const person = usePersonfromPatient(patientUuid);
  const causeOfDeath = useCauseOfDeathConcept();
  const conceptAnswers = useConceptAnswers(causeOfDeath.value);
  const result = useMemo(() => {
    return {
      conceptAnswers: conceptAnswers.conceptAnswers,
      deathDate: person.personObject?.deathDate,
      personUuid: person.personObject?.uuid,
      isDead: person.personObject?.dead,
      isLoading: person.isPersonLoading && causeOfDeath.isCauseOfDeathLoading && causeOfDeath.isCauseOfDeathLoading,
      isValidating:
        person.isPersonValidating && conceptAnswers.isConceptAnswerValidating && causeOfDeath.isCauseOfDeathValidating,
    };
  }, [
    causeOfDeath.isCauseOfDeathLoading,
    causeOfDeath.isCauseOfDeathValidating,
    conceptAnswers,
    person.isPersonLoading,
    person.isPersonValidating,
    person.personObject?.dead,
    person.personObject?.deathDate,
    person.personObject?.uuid,
  ]);
  return result;
}

export function useSetDeceased(
  deceasedDate: Date,
  isDead: boolean,
  personUuid: string,
  selectedCauseOfDeathValue: string,
  abortController: AbortController,
) {
  const patientPayload = {
    deathDate: null,
    causeOfDeath: null,
    dead: false,
  };
  const newPatientPayLoad = {
    deathDate: toDateObjectStrict(
      toOmrsIsoString(new Date(dayjs(deceasedDate).year(), dayjs(deceasedDate).month(), dayjs(deceasedDate).date())),
    ),
    causeOfDeath: selectedCauseOfDeathValue,
    dead: true,
  };
  const payload = isDead ? patientPayload : newPatientPayLoad;
  return openmrsFetch(`/ws/rest/v1/person/${personUuid}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function useConceptAnswers(conceptUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: { answers: ConcentAnswersResponse } }, Error>(
    `/ws/rest/v1/concept/${conceptUuid}`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      conceptAnswers: data ? data?.data?.answers : null,
      isConceptLoading: !data && !error,
      conceptError: error,
      isConceptAnswerValidating: isValidating,
    };
  }, [data, error, isValidating]);
  return result;
}

export function usePersonfromPatient(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: PersonFetchResponse }, Error>(
    `/ws/rest/v1/patient/${patientUuid}`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      personObject: data ? data?.data?.person : null,
      personError: error,
      isPersonLoading: !data && !error,
      isPersonError: error,
      isPersonValidating: isValidating,
    };
  }, [data, error, isValidating]);
  return result;
}

export function useCauseOfDeathConcept() {
  const { data, error, isValidating } = useSWR<{ data: CauseOfDeathFetchResponse }>(
    `/ws/rest/v1/systemsetting/concept.causeOfDeath`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      value: data ? data?.data.value : null,
      isCauseOfDeathLoading: !data && !error,
      isCauseOfDeathValidating: isValidating,
    };
  }, [data, error, isValidating]);
  return result;
}
