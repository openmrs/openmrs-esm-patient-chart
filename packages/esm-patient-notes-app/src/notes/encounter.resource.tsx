import { openmrsFetch, openmrsObservableFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESTPatientNote } from '../types';

export function getEncounters(patientIdentifer: string, abortController: AbortController) {
  return openmrsFetch(`${fhirBaseUrl}/Encounter?identifier=${patientIdentifer}`, {
    signal: abortController.signal,
  });
}

export function getEncounterById(encounterId: string) {
  return openmrsFetch(`${fhirBaseUrl}/Encounter?${encounterId}`);
}

export function getEncounterByUuid(encounterUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/Encounter?_id=${encounterUuid}`);
}

export function searchEncounterByPatientIdentifierWithMatchingVisit(patientIdentifer: string, visitUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/Encounter?identifier=${patientIdentifer},part-of=${visitUuid}`);
}

export function getEncounterObservableRESTAPI(patientUuid: string) {
  return openmrsObservableFetch<{ results: Array<RESTPatientNote> }>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&v=custom:(uuid,display,encounterDatetime,location:(uuid,display,name),encounterType:(name,uuid),auditInfo:(creator:(display),changedBy:(display)),encounterProviders:(provider:(person:(display))))`,
  ).pipe(
    map(({ data }) => data.results ?? []),
    map((notes) => formatNotes(notes)),
    map((data) => data.sort((a, b) => (a.encounterDate < b.encounterDate ? 1 : -1))),
  );
}

export function fetchEncounterByUuid(encounterUuid): Observable<any> {
  return openmrsObservableFetch(`/ws/rest/v1/encounter/${encounterUuid}`).pipe(map(({ data }) => data));
}

function formatNotes(notes: Array<RESTPatientNote>): Array<PatientNote> {
  return notes.map(mapNoteProperties);
}

function mapNoteProperties(note: RESTPatientNote): PatientNote {
  return {
    id: note.uuid,
    encounterDate: note.encounterDatetime,
    encounterType: note.encounterType?.name,
    encounterLocation: note.location?.display,
    encounterAuthor: note.encounterProviders?.[0]?.provider?.person?.display,
  };
}

export type PatientNote = {
  id: string;
  encounterAuthor?: string;
  encounterDate: string;
  encounterType: string;
  encounterLocation: string;
};
