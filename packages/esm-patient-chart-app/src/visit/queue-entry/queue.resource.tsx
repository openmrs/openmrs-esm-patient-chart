import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, Visit } from '@openmrs/esm-framework';
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
  visitQueueEntriesCount: number;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

export function useVisitQueueEntries(patientUuid, visitUuid, currServiceName): UseVisitQueueEntries {
  const { queueLocations } = useQueueLocations();
  const queueLocationUuid = queueLocations[0]?.id;

  const apiUrl = `/ws/rest/v1/visit-queue-entry?location=${queueLocationUuid}&v=full`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapVisitQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
    id: visitQueueEntry.queueEntry.uuid,
    name: visitQueueEntry.queueEntry.display,
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

  let visitQueues = data?.data?.results?.map(mapVisitQueueEntryProperties);

  if (currServiceName) {
    visitQueues.filter((data) => data.service === currServiceName);
  }

  const mappedPatientsVisitQueueEntries =
    visitQueues?.find(
      (visitQueueEntry) => visitQueueEntry?.patientUuid == patientUuid && visitUuid === visitQueueEntry.visitUuid,
    ) ?? null;

  return {
    queueEntry: mappedPatientsVisitQueueEntries, // patients current active queue
    visitQueueEntriesCount: visitQueues ? visitQueues.length : 0, // count of patients in queue
    isLoading,
    isError: error,
    isValidating,
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
  const { data, error } = useSWR<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );
  return { queueLocations: queueLocations ? queueLocations : [], isLoading: !data && !error, error };
}
