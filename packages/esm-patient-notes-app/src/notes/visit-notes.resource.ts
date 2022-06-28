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
  DiagnosisPayload,
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

  const customRepresentation =
    'custom:(uuid,display,encounterDatetime,patient,obs,' +
    'encounterProviders:(uuid,display,' +
    'encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display))),diagnoses';

  const encountersApiUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&obs=${visitDiagnosesConceptUuid}&v=${customRepresentation}`;
  const { data, error, isValidating } = useSWR<{ data: EncountersFetchResponse }, Error>(
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
  return openmrsObservableFetch<Array<DiagnosisData>>(`/ws/rest/v1/concept?q=${searchTerm}&v=full`).pipe(
    map(({ data }) => data['results']),
    map((data: Array<DiagnosisData>) => formatDiagnoses(data)),
  );
}

function formatDiagnoses(diagnoses: Array<DiagnosisData>): Array<Diagnosis> {
  return diagnoses.map(mapDiagnosisProperties);
}

function mapDiagnosisProperties(diagnosis: DiagnosisData): Diagnosis {
  return {
    uuid: diagnosis.uuid,
    concept: diagnosis.name,
    conceptReferenceTermCode: getConceptReferenceTermCode(diagnosis.mappings).conceptReferenceTerm.display,
    primary: false,
    confirmed: true,
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
export function savePatientDiagnoses(abortController: AbortController, payload: DiagnosisPayload) {
  return openmrsFetch(`/ws/rest/v1/patientdiagnoses`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
  });
}

function getConceptReferenceTermCode(conceptMapping: Array<ConceptMapping>): ConceptMapping {
  return conceptMapping.find((concept) => concept.conceptReferenceTerm.display);
}
