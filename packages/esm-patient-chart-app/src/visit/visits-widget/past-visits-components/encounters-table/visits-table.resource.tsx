import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
