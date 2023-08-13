import { openmrsFetch } from '@openmrs/esm-framework';

export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
