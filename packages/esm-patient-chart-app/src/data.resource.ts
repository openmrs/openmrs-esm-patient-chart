import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

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

interface CauseOfDeathPayload {
  causeOfDeath?: string;
  causeOfDeathNonCoded?: string;
  dead: boolean;
  deathDate?: Date;
}

interface ProviderAttribute {
  attributeType: {
    display: string;
  };
  value: string;
  voided: boolean;
}

interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number | null;
  birthdate: string | null;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string | null;
  causeOfDeath: string | null;
  preferredName: {
    uuid: string;
    display: string;
  };
  preferredAddress: unknown;
  attributes: ProviderAttribute[];
  voided: boolean;
  birthtime: string | null;
  deathdateEstimated: boolean;
}

interface Provider {
  uuid: string;
  display: string;
  person: Person;
  retired: boolean;
  attributes: ProviderAttribute[];
}

interface ProviderFetchResponse {
  results: Provider[];
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

const changePatientDeathStatus = (personUuid: string, payload: CauseOfDeathPayload) => {
  const abortController = new AbortController();

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
  nonCodedCauseOfDeath?: string | undefined,
) {
  const payload: CauseOfDeathPayload = {
    dead: true,
    deathDate: deceasedDate || null,
    ...(nonCodedCauseOfDeath
      ? { causeOfDeathNonCoded: nonCodedCauseOfDeath }
      : {
          causeOfDeath: selectedCauseOfDeathValue,
        }),
  };

  return changePatientDeathStatus(personUuid, payload);
}

export function markPatientAlive(personUuid: string) {
  return changePatientDeathStatus(personUuid, {
    causeOfDeath: null,
    causeOfDeathNonCoded: null,
    dead: false,
    deathDate: null,
  });
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
  const { data, error, isLoading, isValidating } = useSWR<{ data: CauseOfDeathFetchResponse }, Error>(
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
      error,
    };
  }, [data?.data?.value, error, isLoading, isValidating]);
  return result;
}

export function useFormByName(formName: string) {
  const { data, error, isLoading, isValidating } = useSWR<
    { data: { results: Array<{ uuid: string; display: string }> } },
    Error
  >(`${restBaseUrl}/form?q=${encodeURIComponent(formName)}`, openmrsFetch);

  return {
    form: data?.data?.results?.[0],
    isLoading,
    error,
    isValidating,
  };
}

export function useProviders() {
  const { data, error, isLoading, isValidating } = useSWR<any[]>(
    `${restBaseUrl}/provider?v=custom:(uuid,display,person:(display),attributes:(attributeType:(display),value))`,
    (url: string) =>
      openmrsFetch(url).then((res) =>
        res.data.results.filter((provider: any) =>
          provider.attributes?.some(
            (attr: any) =>
              attr.attributeType?.display === 'practitioner_type' &&
              attr.value?.toLowerCase() === 'doctor'
          )
        )
      )
  );

  const result = useMemo(() => {
    return {
      value: data ?? [],
      isProvidersLoading: isLoading,
      isProvidersValidating: isValidating,
      error,
    };
  }, [data, isLoading, isValidating, error]);

  return result;
}
