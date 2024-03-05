import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { map } from 'rxjs/operators';
import { openmrsFetch, openmrsObservableFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import {
  type EncountersFetchResponse,
  type RESTPatientNote,
  type PatientNote,
  type VisitNotePayload,
  type DiagnosisPayload,
  type Concept,
} from '../types';

interface UseVisitNotes {
  visitNotes: Array<PatientNote> | null;
  isError: Error;
  isLoading: boolean;
  isValidating?: boolean;
  mutateVisitNotes: () => void;
}

export function useVisitNotes(patientUuid: string): UseVisitNotes {
  const {
    visitNoteConfig: { encounterNoteTextConceptUuid, visitDiagnosesConceptUuid },
  } = useConfig();

  const customRepresentation =
    'custom:(uuid,display,encounterDatetime,patient,obs,' +
    'encounterProviders:(uuid,display,' +
    'encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display))),' +
    'diagnoses';
  const encountersApiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&obs=${visitDiagnosesConceptUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: EncountersFetchResponse }, Error>(
    encountersApiUrl,
    openmrsFetch,
  );

  const mapNoteProperties = (note: RESTPatientNote, index: number): PatientNote => ({
    id: `${index}`,
    diagnoses: note.diagnoses
      .map((diagnosisData) => diagnosisData.display)
      .filter((val) => val)
      .join(', '),
    encounterDate: note.encounterDatetime,
    encounterNote: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)?.value,
    encounterNoteRecordedAt: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)
      ?.obsDatetime,
    encounterProvider: note?.encounterProviders[0]?.provider?.person?.display,
    encounterProviderRole: note?.encounterProviders[0]?.encounterRole?.display,
  });

  const formattedVisitNotes = data?.data?.results
    ?.map(mapNoteProperties)
    ?.sort((noteA, noteB) => new Date(noteB.encounterDate).getTime() - new Date(noteA.encounterDate).getTime());

  return {
    visitNotes: data ? formattedVisitNotes : null,
    isError: error,
    isLoading,
    isValidating,
    mutateVisitNotes: mutate,
  };
}

export function useInfiniteVisits(patientUuid: string) {
  const config = useConfig();
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:full,encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

  const getKey = (pageIndex, previousPageData) => {
    const pageSize = config.numberOfVisitsToLoad;

    if (previousPageData && !previousPageData?.data?.links.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}&limit=${pageSize}`;

    if (pageIndex) {
      url += `&startIndex=${pageIndex * pageSize}`;
    }

    return url;
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } = useSWRInfinite(
    patientUuid ? getKey : null,
    openmrsFetch,
    { parallel: true },
  );

  return {
    visits: data ? [].concat(data?.flatMap((page) => page.data.results)) : null,
    error,
    hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
    isLoading,
    isValidating,
    mutateVisits: mutate,
    setSize,
    size,
  };
}

export function fetchConceptDiagnosisByName(searchTerm: string) {
  return openmrsObservableFetch<Array<Concept>>(
    `${restBaseUrl}/concept?q=${searchTerm}&searchType=fuzzy&class=8d4918b0-c2cc-11de-8d13-0010c6dffd0f&q=&v=custom:(uuid,display)`,
  ).pipe(map(({ data }) => data['results']));
}

export function saveVisitNote(abortController: AbortController, payload: VisitNotePayload) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function savePatientDiagnosis(abortController: AbortController, payload: DiagnosisPayload) {
  return openmrsFetch(`${restBaseUrl}/patientdiagnoses`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
  });
}
