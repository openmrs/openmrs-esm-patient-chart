import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch, useConfig, openmrsObservableFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { ChartConfig } from '../../config-schema';
import { Observable } from 'rxjs';
import { useMemo } from 'react';
import useSWR from 'swr';

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

interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}

export function useServices(location: string) {
  const config = useConfig() as ChartConfig;
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;
  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(
    config.showServiceQueueFields && location ? apiUrl : null,
    openmrsFetch,
  );

  return {
    services: data ? data?.data.results : [],
  };
}

export function useStatuses() {
  const config = useConfig() as ChartConfig;
  const statusConceptSetUuid = config.statusConceptSetUuid;

  const apiUrl = `/ws/rest/v1/concept/${statusConceptSetUuid}`;
  const { data, error, isLoading } = useSWRImmutable<FetchResponse>(
    config.showServiceQueueFields ? apiUrl : null,
    openmrsFetch,
  );

  return {
    statuses: data ? data?.data?.setMembers : [],
    isLoading,
  };
}

export function usePriorities() {
  const config = useConfig() as ChartConfig;
  const priorityConceptSetUuid = config.priorityConceptSetUuid;

  const apiUrl = `/ws/rest/v1/concept/${priorityConceptSetUuid}`;
  const { data } = useSWRImmutable<FetchResponse>(config.showServiceQueueFields ? apiUrl : null, openmrsFetch);

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

export function useQueueLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error } = useSWR<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );
  return { queueLocations: queueLocations ? queueLocations : [], isLoading: !data && !error, error };
}
