import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, usePatient } from '@openmrs/esm-framework';

interface CauseOfDeathFetchResponse {
  uuid: string;
  value: string;
}

interface DeathPayload {
  deathDate?: Date;
  dead: boolean;
  causeOfDeath?: string;
}

export interface ConceptAnswer {
  uuid: string;
  name: string;
  display: string;
}

interface ConceptAnswersResponse {
  answers?: Array<ConceptAnswer>;
}

export function usePatientDeathConcepts() {
  const { isCauseOfDeathLoading, isCauseOfDeathValidating, value: causeOfDeathConcept } = useCauseOfDeathConcept();
  const { isConceptLoading, isConceptAnswerValidating, conceptAnswers } = useConceptAnswers(causeOfDeathConcept);

  return {
    conceptAnswers: conceptAnswers,
    isLoading: isCauseOfDeathLoading || isConceptLoading,
    isValidating: isConceptAnswerValidating || isCauseOfDeathValidating,
  };
}

export function usePatientDeceased(patientUuid: string) {
  const { isLoading: isPatientLoading, patient } = usePatient(patientUuid);

  if (isPatientLoading) {
    return {
      deathDate: undefined,
      isDead: undefined,
      isLoading: isPatientLoading,
    };
  }

  return {
    deathDate: patient?.deceasedDateTime,
    isDead: patient?.deceasedBoolean ?? Boolean(patient?.deceasedDateTime),
    isLoading: isPatientLoading,
  };
}

const changePatientDeathStatus = (personUuid: string, payload: DeathPayload, abortController: AbortController) => {
  return openmrsFetch(`/ws/rest/v1/person/${personUuid}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
};

export function markPatientDeceased(
  deceasedDate: Date,
  personUuid: string,
  selectedCauseOfDeathValue: string | undefined,
  abortController: AbortController,
) {
  const payload: DeathPayload = {
    causeOfDeath: selectedCauseOfDeathValue,
    dead: true,
  };

  if (deceasedDate) {
    payload.deathDate = new Date(deceasedDate.getFullYear(), deceasedDate.getMonth(), deceasedDate.getDay());
  } else {
    payload.deathDate = null;
  }

  return changePatientDeathStatus(personUuid, payload, abortController);
}

export function markPatientAlive(personUuid: string, abortController: AbortController) {
  return changePatientDeathStatus(
    personUuid,
    {
      deathDate: null,
      causeOfDeath: null,
      dead: false,
    },
    abortController,
  );
}

export function useConceptAnswers(conceptUuid: string) {
  const { data, error, isLoading, isValidating } = useSWR<{ data: ConceptAnswersResponse }, Error>(
    `/ws/rest/v1/concept/${conceptUuid}`,
    (url) => (conceptUuid ? openmrsFetch(url) : undefined),
    {
      shouldRetryOnError(err) {
        return err instanceof Response && err.status !== 404;
      },
    },
  );

  return {
    conceptAnswers: data?.data?.answers ?? ([] as ConceptAnswer[]),
    isConceptLoading: isLoading,
    conceptError: error,
    isConceptAnswerValidating: isValidating,
  };
}

export function useCauseOfDeathConcept() {
  const { data, error, isLoading, isValidating } = useSWR<{ data: CauseOfDeathFetchResponse }>(
    `/ws/rest/v1/systemsetting/concept.causeOfDeath`,
    openmrsFetch,
    {
      shouldRetryOnError(err) {
        return err instanceof Response && err.status !== 404;
      },
    },
  );
  const result = useMemo(() => {
    return {
      value: data?.data?.value ?? undefined,
      isCauseOfDeathLoading: isLoading,
      isCauseOfDeathValidating: isValidating,
    };
  }, [data, isLoading, isValidating]);
  return result;
}
