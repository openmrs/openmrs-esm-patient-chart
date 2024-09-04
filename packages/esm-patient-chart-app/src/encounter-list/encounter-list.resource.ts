import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function fetchOpenMRSForms(formUuids: string[]) {
  const fetch = (uuid) => openmrsFetch(`/ws/rest/v1/form/${uuid}`);
  return Promise.all(formUuids.map((uuid) => fetch(uuid)));
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
