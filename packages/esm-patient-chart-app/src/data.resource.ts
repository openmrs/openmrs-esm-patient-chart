import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, usePatient } from '@openmrs/esm-framework';

interface CauseOfDeathFetchResponse {
  uuid: string;
  value: string;
}

export interface ConceptAnswer {
  display: string;
  name: string;
  uuid: string;
}

interface ConceptAnswersResponse {
  answers?: Array<ConceptAnswer>;
}

interface DeathPayload {
  causeOfDeath?: string;
  dead: boolean;
  deathDate?: Date;
}

export function useCausesOfDeath() {
  const { isCauseOfDeathLoading, isCauseOfDeathValidating, value: causeOfDeathConcept } = useCauseOfDeathConcept();
  const { isConceptLoading, isConceptAnswerValidating, conceptAnswers } = useConceptAnswers(causeOfDeathConcept);

  return {
    causesOfDeath: conceptAnswers,
    isLoading: isCauseOfDeathLoading || isConceptLoading,
    isValidating: isConceptAnswerValidating || isCauseOfDeathValidating,
  };
}

export function usePatientDeceasedStatus(patientUuid: string) {
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
  return openmrsFetch(`${restBaseUrl}/person/${personUuid}`, {
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
) {
  const abortController = new AbortController();
  const payload: DeathPayload = {
    causeOfDeath: selectedCauseOfDeathValue,
    dead: true,
  };

  if (deceasedDate) {
    payload.deathDate = deceasedDate;
  } else {
    payload.deathDate = null;
  }

  return changePatientDeathStatus(personUuid, payload, abortController);
}

export function markPatientAlive(personUuid: string) {
  const abortController = new AbortController();
  return changePatientDeathStatus(
    personUuid,
    {
      causeOfDeath: null,
      dead: false,
      deathDate: null,
    },
    abortController,
  );
}

export function useConceptAnswers(conceptUuid: string) {
  const { data, error, isLoading, isValidating } = useSWR<{ data: ConceptAnswersResponse }, Error>(
    `${restBaseUrl}/concept/${conceptUuid}`,
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
    `${restBaseUrl}/systemsetting/concept.causeOfDeath`,
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
