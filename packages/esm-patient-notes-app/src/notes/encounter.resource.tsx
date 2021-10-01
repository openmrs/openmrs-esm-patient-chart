import useSWR from 'swr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { openmrsFetch, openmrsObservableFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { EncountersFetchResponse, RESTPatientNote, PatientNote } from '../types';

export const encountersCustomRepresentation =
  'custom:(uuid,display,encounterDatetime,' +
  'location:(uuid,display,name),' +
  'encounterType:(name,uuid),' +
  'auditInfo:(creator:(display),changedBy:(display)),' +
  'encounterProviders:(provider:(person:(display))))';

export function useEncounters(patientUuid: string) {
  const encountersApiUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&v=${encountersCustomRepresentation}`;

  const { data, error, isValidating } = useSWR<{ data: EncountersFetchResponse }, Error>(
    encountersApiUrl,
    openmrsFetch,
  );

  const formattedNotes = data?.data?.results.length
    ? data?.data?.results.map(mapNoteProperties).sort((a, b) => (b?.encounterDate > a?.encounterDate ? 1 : -1))
    : null;

  return {
    data: data ? formattedNotes : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

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

export function fetchEncounterByUuid(encounterUuid): Observable<any> {
  return openmrsObservableFetch(`/ws/rest/v1/encounter/${encounterUuid}`).pipe(map(({ data }) => data));
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
