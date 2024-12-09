import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function fetchOpenMRSForms(formUuid: string) {
  return openmrsFetch(`${restBaseUrl}/form/${formUuid}`).then(({ data }) => {
    if (data.results.length) {
      return data.results;
    }
    return null;
  });
}

export function fetchPatientRelationships(patientUuid: string) {
  return openmrsFetch(`${restBaseUrl}relationship?person=${patientUuid}&v=full`).then(({ data }) => {
    if (data.results.length) {
      return data.results;
    }
    return null;
  });
}

export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
