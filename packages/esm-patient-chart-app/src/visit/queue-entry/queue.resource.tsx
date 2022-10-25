import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';
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
  service: QueueService;
  status: QueueStatus;
  statusUuid: string;
  visitUuid: string;
  visitType: string;
  queueUuid: string;
  queueEntryUuid: string;
}

interface UseVisitQueueEntries {
  visitQueueEntries: Array<MappedVisitQueueEntry> | null;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

export function useVisitQueueEntries(): UseVisitQueueEntries {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
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
    service: visitQueueEntry.queueEntry.queue.service.display,
    status: visitQueueEntry.queueEntry.status.display,
    statusUuid: visitQueueEntry.queueEntry.status.uuid,
    visitUuid: visitQueueEntry.visit?.uuid,
    visitType: visitQueueEntry.visit?.visitType?.display,
    queueUuid: visitQueueEntry.queueEntry.queue.uuid,
    queueEntryUuid: visitQueueEntry.queueEntry.uuid,
  });

  const mappedVisitQueueEntries = data?.data?.results?.map(mapVisitQueueEntryProperties);

  return {
    visitQueueEntries: mappedVisitQueueEntries ? mappedVisitQueueEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
