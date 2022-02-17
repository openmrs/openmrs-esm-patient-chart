import useSWR from 'swr';
import { map } from 'rxjs/operators';
import { openmrsFetch, openmrsObservableFetch, useConfig } from '@openmrs/esm-framework';
import {
  EncountersFetchResponse,
  RESTPatientNote,
  PatientNote,
  ConceptMapping,
  Diagnosis,
  DiagnosisData,
  Location,
  Provider,
  VisitNotePayload,
} from '../types';

interface UseVisitNotes {
  visitNotes: Array<PatientNote> | null;
  isError: Error;
  isLoading: boolean;
  isValidating?: boolean;
}

export function useVisitNotes(patientUuid: string): UseVisitNotes {
  const {
    visitNoteConfig: { encounterNoteTextConceptUuid, problemListConceptUuid, visitDiagnosesConceptUuid },
  } = useConfig();
  const encountersApiUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&obsConcept=${visitDiagnosesConceptUuid}&v=full`;
  const { data, error, isValidating } = useSWR<{ data: EncountersFetchResponse }, Error>(
    encountersApiUrl,
    openmrsFetch,
  );

  const mapNoteProperties = (note: RESTPatientNote, index: number): PatientNote => ({
    id: `${index}`,
    encounterDate: note.encounterDatetime,
    diagnoses: note.obs
      .map(
        (observation) =>
          observation.groupMembers?.find((mem) => mem.concept.uuid === problemListConceptUuid)?.value?.display,
      )
      .filter((val) => val)
      .join(', '),
    encounterNote: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)?.value,
    encounterNoteRecordedAt: note.obs.find((observation) => observation.concept.uuid === encounterNoteTextConceptUuid)
      ?.obsDatetime,
  });

  const formattedVisitNotes = data?.data?.results?.map(mapNoteProperties);

  return {
    visitNotes: data ? formattedVisitNotes : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function fetchLocationByUuid(abortController: AbortController, locationUuid: string) {
  return openmrsFetch<Location>(`/ws/rest/v1/location/${locationUuid}`, {
    signal: abortController.signal,
  });
}

export function fetchProviderByUuid(abortController: AbortController, providerUuid: string) {
  return openmrsFetch<Provider>(`/ws/rest/v1/provider/${providerUuid}`, {
    signal: abortController.signal,
  });
}

export function fetchDiagnosisByName(searchTerm: string) {
  return openmrsObservableFetch<Array<DiagnosisData>>(`/coreapps/diagnoses/search.action?&term=${searchTerm}`).pipe(
    map(({ data }) => data),
    map((data: Array<DiagnosisData>) => formatDiagnoses(data)),
  );
}

function formatDiagnoses(diagnoses: Array<DiagnosisData>): Array<Diagnosis> {
  return diagnoses.map(mapDiagnosisProperties);
}

function mapDiagnosisProperties(diagnosis: DiagnosisData): Diagnosis {
  return {
    concept: diagnosis.concept,
    conceptReferenceTermCode: getConceptReferenceTermCode(diagnosis.concept.conceptMappings).conceptReferenceTerm.code,
    primary: false,
    confirmed: false,
  };
}

export function saveVisitNote(abortController: AbortController, payload: VisitNotePayload) {
  return openmrsFetch(`/ws/rest/v1/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

function getConceptReferenceTermCode(conceptMapping: Array<ConceptMapping>): ConceptMapping {
  return conceptMapping.find((concept) => concept.conceptReferenceTerm.conceptSource.name === 'ICD-10-WHO');
}
