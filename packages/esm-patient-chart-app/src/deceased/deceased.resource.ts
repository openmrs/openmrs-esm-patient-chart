import { openmrsFetch, toOmrsIsoString, toDateObjectStrict } from '@openmrs/esm-framework';
import { Observable } from 'rxjs';
import { openmrsObservableFetch } from '@openmrs/esm-api';
import useSWR from 'swr';
import dayjs from 'dayjs';

interface PersonFetchResponse {
  uuid: string;
  dead: boolean;
  deathDate: Date;
  type: string;
}

export function usePatientDeceased(patientUuid: string) {
  const { personObject, isPersonLoading, isPersonError } = usePersonfromPatient(patientUuid);
  const { conceptAnswers, isConceptLoading, isConceptError } = useConceptAnswers();

  return {
    conceptAnswers,
    deathDate: personObject.deathDate,
    personUuid: personObject.uuid,
    isDead: personObject.dead,
    isLoading: isPersonLoading && isConceptLoading,
    isError: { isPersonError, isConceptError },
  };
}

export function useSetDeceased(deceasedDate, isDead, personUuid, selectedCauseOfDeath) {
  const patientPayload = {
    deathDate: null,
    causeOfDeath: null,
    dead: false,
  };
  const newPatientPayLoad = {
    deathDate: toDateObjectStrict(
      toOmrsIsoString(new Date(dayjs(deceasedDate).year(), dayjs(deceasedDate).month(), dayjs(deceasedDate).date())),
    ),
    causeOfDeath: selectedCauseOfDeath,
    dead: true,
  };
  return setDeceased(isDead ? patientPayload : newPatientPayLoad, personUuid, new AbortController());
}

export function setDeceased(payload: any, personUuid: string, abortController: AbortController): Observable<any> {
  return openmrsObservableFetch(`/ws/rest/v1/person/${personUuid}`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}

export function useConceptAnswers() {
  const { conceptUuid } = useCauseOfDeathConcept();
  const { data, error, isValidating } = useSWR(`/ws/rest/v1/concept/${conceptUuid}`, openmrsFetch);
  return {
    conceptAnswers: data ? data.data : null,
    isConceptLoading: !data && !error,
    isConceptError: error,
    isValidating,
  };
}

export function usePersonfromPatient(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: PersonFetchResponse }, Error>(
    `/ws/rest/v1/patient/${patientUuid}`,
    openmrsFetch,
  );
  // .then((res) => {
  //   const person = res.data.person;
  //   return { uuid: person.uuid, dead: person.dead, deathDate: person.deathDate };
  // });
  return {
    personObject: data ? data.data : null,
    isPersonLoading: !data && !error,
    isPersonError: error,
    isValidating,
  };
}

function useCauseOfDeathConcept() {
  const { data } = useSWR<{ data: { value } }, Error>(`/ws/rest/v1/systemsetting/concept.causeOfDeath`, openmrsFetch);
  return {
    conceptUuid: data ? data?.data?.value : null,
  };
}
