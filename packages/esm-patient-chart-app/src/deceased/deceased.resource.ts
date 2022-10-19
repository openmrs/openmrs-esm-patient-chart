import { useMemo } from 'react';

import { openmrsFetch, toOmrsIsoString, toDateObjectStrict } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';

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
      refetchPatient: person.mutate,
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
    person.mutate,
  ]);
  return result;
}

const changePatientDeathStatus = (
  deathDate: Date,
  dead: boolean,
  personUuid: string,
  causeOfDeath: string,
  abortController: AbortController,
) => {
  return openmrsFetch(`/ws/rest/v1/person/${personUuid}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: { deathDate, dead, causeOfDeath },
    signal: abortController.signal,
  });
};

export function markPatientDeceased(
  deceasedDate: Date | null,
  personUuid: string,
  selectedCauseOfDeathValue: string | null,
  abortController: AbortController,
) {
  const payload = {
    deathDate: toDateObjectStrict(
      toOmrsIsoString(new Date(dayjs(deceasedDate).year(), dayjs(deceasedDate).month(), dayjs(deceasedDate).date())),
    ),
    causeOfDeath: selectedCauseOfDeathValue,
    dead: true,
  };
  return changePatientDeathStatus(payload.deathDate, true, personUuid, payload.causeOfDeath, abortController);
}

export function markPatientAlive(personUuid: string, abortController: AbortController) {
  return changePatientDeathStatus(null, false, personUuid, null, abortController);
}

export function useConceptAnswers(conceptUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: { answers: ConcentAnswersResponse } }, Error>(
    `/ws/rest/v1/concept/${conceptUuid}`,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      conceptAnswers: data?.data?.answers ?? null,
      isConceptLoading: !data && !error,
      conceptError: error,
      isConceptAnswerValidating: isValidating,
    };
  }, [data, error, isValidating]);
  return result;
}

export function usePersonfromPatient(patientUuid: string) {
  const { data, error, isValidating, mutate } = useSWR<{ data: PersonFetchResponse }, Error>(
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
      mutate,
    };
  }, [data, error, isValidating, mutate]);
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
