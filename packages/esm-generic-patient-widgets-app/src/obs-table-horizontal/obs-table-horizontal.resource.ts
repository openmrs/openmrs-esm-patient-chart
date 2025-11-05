import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function updateObservation(observationUuid: string, value: string | number) {
  return openmrsFetch(`${restBaseUrl}/obs/${observationUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });
}

/**
 * Creates a new observation in an existing encounter
 * @returns Promise with the updated encounter containing the new observation
 */
export function createObservationInEncounter(
  encounterUuid: string,
  patientUuid: string,
  conceptUuid: string,
  value: string | number,
) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient: patientUuid,
      obs: [
        {
          concept: conceptUuid,
          value: value,
        },
      ],
    }),
  });
}
