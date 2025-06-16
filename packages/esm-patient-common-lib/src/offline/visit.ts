import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getSynchronizationItems,
  queueSynchronizationItem,
  useConnectivity,
  useSession,
  useVisit,
  type NewVisitPayload,
  type QueueItemDescriptor,
  type Visit,
} from '@openmrs/esm-framework';

/**
 * The identifier of a visit in the sync queue.
 */
export const visitSyncType = 'visit';

/**
 * The shape of an offline visit queued up by the patient chart.
 */
export interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}

/**
 * Similar to {@link useVisit}, returns the given patient's active visit, but also considers
 * offline visits created by the patient chart while offline.
 * @param patientUuid The UUID of the patient.
 */
export function useVisitOrOfflineVisit(patientUuid: string) {
  const isOnline = useConnectivity();

  const onlineVisit = useVisit(patientUuid);
  const offlineVisit = useOfflineVisit(patientUuid);

  return isOnline ? onlineVisit : offlineVisit;
}

/**
 * Returns the patient's current offline visit.
 * @param patientUuid The UUID of the patient.
 */
export function useOfflineVisit(patientUuid: string): ReturnType<typeof useVisit> {
  const [offlineVisitState, setOfflineVisitState] = useState<{
    data: Visit | null;
    error: Error | null;
    isLoading: boolean;
  }>({ data: null, error: null, isLoading: true });
  useEffect(() => {
    getOfflineVisitForPatient(patientUuid)
      .then((offlineVisit) => {
        setOfflineVisitState({
          error: null,
          data: offlineVisit ? offlineVisitToVisit(offlineVisit) : null,
          isLoading: false,
        });
      })
      .catch((err) => {
        setOfflineVisitState({ error: err, data: null, isLoading: false });
      });
  }, [patientUuid]);

  return {
    activeVisit: offlineVisitState.data,
    currentVisit: offlineVisitState.data,
    isLoading: offlineVisitState.isLoading,
    isValidating: false,
    currentVisitIsRetrospective: false,
    error: offlineVisitState.error,
    mutate: () => {},
  };
}

/**
 * While offline, if no offline visit for the given patient exists, creates one.
 * The existance of the offline visit leverages {@link useOfflineVisit}.
 * Mutates those SWR hooks when a new offline visit has been created.
 * @param patientUuid The UUID of the patient for which an offline visit should be created.
 * @param offlineVisitTypeUuid The UUID of the offline visit type.
 */
export function useAutoCreatedOfflineVisit(patientUuid: string, offlineVisitTypeUuid: string) {
  const isOnline = useConnectivity();
  const location = useSession()?.sessionLocation?.uuid;
  const { currentVisit, isValidating, error, mutate } = useOfflineVisit(patientUuid);

  useEffect(() => {
    if (!isOnline && !isValidating && !currentVisit && !error) {
      createOfflineVisitForPatient(patientUuid, location, offlineVisitTypeUuid, new Date()).finally(() => mutate());
    }
  }, [isOnline, currentVisit, isValidating, error, mutate, location, offlineVisitTypeUuid, patientUuid]);
}

export async function getOfflineVisitForPatient(patientUuid: string) {
  const offlineVisits = await getSynchronizationItems<OfflineVisit>(visitSyncType);
  return offlineVisits.find((visit) => visit.patient === patientUuid);
}

export async function createOfflineVisitForPatient(
  patientUuid: string,
  location: string,
  offlineVisitTypeUuid: string,
  startDatetime: Date,
) {
  const patientRegistrationSyncItems = await getSynchronizationItems<{ fhirPatient: fhir.Patient }>(
    'patient-registration',
  );
  const isVisitForOfflineRegisteredPatient = patientRegistrationSyncItems.some(
    (item) => item.fhirPatient.id === patientUuid,
  );

  const offlineVisit: OfflineVisit = {
    uuid: uuid(),
    patient: patientUuid,
    startDatetime,
    location,
    visitType: offlineVisitTypeUuid,
  };

  const descriptor: QueueItemDescriptor = {
    id: offlineVisit.uuid,
    displayName: 'Offline visit',
    patientUuid,
    dependencies: isVisitForOfflineRegisteredPatient
      ? [
          {
            type: 'patient-registration',
            id: patientUuid,
          },
        ]
      : [],
  };

  await queueSynchronizationItem(visitSyncType, offlineVisit, descriptor);
  return offlineVisit;
}

function offlineVisitToVisit(offlineVisit: OfflineVisit): Visit {
  return {
    uuid: offlineVisit.uuid,
    startDatetime: offlineVisit.startDatetime?.toString(),
    stopDatetime: offlineVisit.stopDatetime?.toString(),
    encounters: [],
    visitType: {
      uuid: offlineVisit.visitType,
      display: 'Offline',
    },
    patient: {
      uuid: offlineVisit.patient,
    },
  };
}
