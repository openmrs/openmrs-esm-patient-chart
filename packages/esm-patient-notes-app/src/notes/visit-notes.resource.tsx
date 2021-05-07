import { openmrsFetch, openmrsObservableFetch } from '@openmrs/esm-framework';
import { map } from 'rxjs/operators';
import { Diagnosis, VisitNotePayload } from './visit-note.util';
import { ConceptMapping, DiagnosisData, Location, Provider, SessionData } from '../types';

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
