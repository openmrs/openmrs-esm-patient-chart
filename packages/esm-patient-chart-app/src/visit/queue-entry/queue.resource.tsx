import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, type Visit } from '@openmrs/esm-framework';
import { useMemo } from 'react';
export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueueService = 'Clinical consultation' | 'Triage';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
}

interface VisitQueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
    person: {
      age: string;
      gender: string;
    };
    phoneNumber: string;
  };
  priority: {
    display: QueuePriority;
    uuid: string;
  };
  providerWaitingFor: null;
  queue: {
    description: string;
    display: string;
    name: string;
    service: {
      display: QueueService;
    };
    uuid: string;
  };
  startedAt: string;
  status: {
    display: QueueStatus;
    uuid: string;
  };
  uuid: string;
  visit: Visit;
}

export interface MappedVisitQueueEntry {
  id: string;
  name: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityUuid: string;
  service: string;
  status: QueueStatus;
  statusUuid: string;
  visitUuid: string;
  visitType: string;
  queueUuid: string;
  queueEntryUuid: string;
}

interface UseVisitQueueEntries {
  queueEntry: MappedVisitQueueEntry | null;
  isLoading: boolean;
  error: Error;
  isValidating?: boolean;
  mutate: () => void;
}

export function useVisitQueueEntry(patientUuid, visitUuid): UseVisitQueueEntries {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?patient=${patientUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapVisitQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
    id: visitQueueEntry.uuid,
    name: visitQueueEntry.queueEntry.queue.display,
    patientUuid: visitQueueEntry.queueEntry.patient.uuid,
    priority:
      visitQueueEntry.queueEntry.priority.display === 'Urgent'
        ? 'Priority'
        : visitQueueEntry.queueEntry.priority.display,
    priorityUuid: visitQueueEntry.queueEntry.priority.uuid,
    service: visitQueueEntry.queueEntry.queue?.display,
    status: visitQueueEntry.queueEntry.status.display,
    statusUuid: visitQueueEntry.queueEntry.status.uuid,
    visitUuid: visitQueueEntry.visit?.uuid,
    visitType: visitQueueEntry.visit?.visitType?.display,
    queueUuid: visitQueueEntry.queueEntry.queue.uuid,
    queueEntryUuid: visitQueueEntry.queueEntry.uuid,
  });

  const mappedVisitQueueEntry =
    data?.data?.results
      ?.map(mapVisitQueueEntryProperties)
      .filter((visitQueueEntry) => visitUuid !== undefined && visitUuid === visitQueueEntry.visitUuid)
      .shift() ?? null;

  return {
    queueEntry: mappedVisitQueueEntry,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}
export function useQueueLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error, isLoading } = useSWR<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );
  return { queueLocations: queueLocations ? queueLocations : [], isLoading, error };
}
