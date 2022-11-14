import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch, useConfig, openmrsObservableFetch } from '@openmrs/esm-framework';
import { ChartConfig } from '../../config-schema';
import { Observable } from 'rxjs';

export interface QueueServiceInfo {
  uuid: string;
  display: string;
  name: string;
  description: string;
}

export interface QueueEntryPayload {
  visit: { uuid: string };
  queueEntry: {
    status: { uuid: string };
    priority: { uuid: string };
    queue: { uuid: string };
    patient: { uuid: string };
    startedAt: Date;
  };
}

export function useServices(location: string) {
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;
  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    allServices: data ? data?.data.results : [],
  };
}

export function useStatus() {
  const config = useConfig() as ChartConfig;
  const statusConceptSetUuid = config.statusConceptSetUuid;

  const apiUrl = `/ws/rest/v1/concept/${statusConceptSetUuid}`;
  const { data, error } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    statuses: data ? data?.data?.setMembers : [],
    isLoading: !data && !error,
  };
}

export function usePriority() {
  const config = useConfig() as ChartConfig;
  const priorityConceptSetUuid = config.priorityConceptSetUuid;

  const apiUrl = `/ws/rest/v1/concept/${priorityConceptSetUuid}`;
  const { data } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    priorities: data ? data?.data?.setMembers : [],
  };
}

export function saveQueueEntry(
  payload: QueueEntryPayload,
  abortController: AbortController,
): Observable<FetchResponse<any>> {
  return openmrsObservableFetch(`/ws/rest/v1/visit-queue-entry`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}
