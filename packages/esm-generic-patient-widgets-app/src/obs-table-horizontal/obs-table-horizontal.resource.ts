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
 * Creates a new encounter
 * @param patientUuid - The UUID of the patient
 * @param encounterTypeUuid - The UUID of the encounter type
 * @param locationUuid - The UUID of the location
 * @param obs - Array of observations to include in the encounter
 * @returns Promise with the created encounter
 */
export function createEncounter(
  patientUuid: string,
  encounterTypeUuid: string,
  locationUuid: string,
  obs: Array<{ concept: string; value: string | number }>,
) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient: patientUuid,
      encounterType: encounterTypeUuid,
      location: locationUuid,
      encounterDatetime: new Date().toISOString(),
      obs: obs,
    }),
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
