import { openmrsFetch, toDateObjectStrict, toOmrsIsoString } from '@openmrs/esm-framework';

export async function saveQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  sortWeight: number,
  abortController: AbortController,
  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  await Promise.all([
    generateVisitQueueNumber(locationUuid, visitUuid, queueUuid, abortController, visitQueueNumberAttributeUuid),
  ]);

  return openmrsFetch(`/ws/rest/v1/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry: {
        status: {
          uuid: status,
        },
        priority: {
          uuid: priority,
        },
        queue: {
          uuid: queueUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
        sortWeight: sortWeight,
      },
    },
  });
}

export async function generateVisitQueueNumber(
  location: string,
  visitUuid: string,
  queueUuid: string,
  abortController: AbortController,
  visitQueueNumberAttributeUuid: string,
) {
  await openmrsFetch(
    `/ws/rest/v1/queue-entry-number?location=${location}&queue=${queueUuid}&visit=${visitUuid}&visitAttributeType=${visitQueueNumberAttributeUuid}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    },
  );
}
