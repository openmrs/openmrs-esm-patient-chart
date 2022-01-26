import { NewVisitPayload } from '@openmrs/esm-api';
import {
  getStartedVisit,
  getSynchronizationItems,
  messageOmrsServiceWorker,
  queueSynchronizationItem,
  saveVisit,
  setupOfflineSync,
  VisitMode,
  VisitStatus,
  subscribeConnectivity,
  QueueItemDescriptor,
  usePatient,
} from '@openmrs/esm-framework';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import useSWR, { SWRResponse } from 'swr';

const visitSyncType = 'visit';
const patientRegistrationSyncType = 'patient-registration';

interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}

export function setupCacheableRoutes() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/fhir2/R4/Patient/.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/visit.+',
  });
}

export function setupOfflineVisitsSync() {
  setupOfflineSync<OfflineVisit>(visitSyncType, [patientRegistrationSyncType], async (visit, options) => {
    const visitPayload = {
      ...visit,
      stopDatetime: new Date(),
    };

    const res = await saveVisit(visitPayload, options.abort).toPromise();
    if (!res.ok) {
      throw new Error(
        `Failed to synchronize offline visit with the UUID: ${visit.uuid}. Error: ${JSON.stringify(res.data)}`,
      );
    }

    return res.data;
  });
}

export function useOfflineVisitForPatient(patientUuid?: string, location?: string) {
  useEffect(() => {
    return subscribeConnectivity(async ({ online }) => {
      if (!online && patientUuid && location) {
        const offlineVisit =
          (await getOfflineVisitForPatient(patientUuid)) ?? (await createOfflineVisitForPatient(patientUuid, location));

        getStartedVisit.next({
          mode: VisitMode.NEWVISIT,
          status: VisitStatus.ONGOING,
          visitData: offlineVisitToVisit(offlineVisit),
        });
      }
    });
  }, [patientUuid, location]);
}

async function getOfflineVisitForPatient(patientUuid: string) {
  const offlineVisits = await getSynchronizationItems<OfflineVisit>(visitSyncType);
  return offlineVisits.find((visit) => visit.patient === patientUuid);
}

async function createOfflineVisitForPatient(patientUuid: string, location: string) {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const isVisitForOfflineRegisteredPatient = patientRegistrationSyncItems.some(
    (item) => item.fhirPatient.id === patientUuid,
  );

  const offlineVisit: OfflineVisit = {
    uuid: v4(),
    patient: patientUuid,
    startDatetime: new Date(),
    location,
    visitType: 'a22733fa-3501-4020-a520-da024eeff088', // "Offline" visit type UUID.
  };

  const descriptor: QueueItemDescriptor = {
    id: offlineVisit.uuid,
    displayName: 'Offline visit',
    dependencies: isVisitForOfflineRegisteredPatient
      ? [
          {
            type: patientRegistrationSyncType,
            id: patientUuid,
          },
        ]
      : [],
  };

  await queueSynchronizationItem(visitSyncType, offlineVisit, descriptor);
  return offlineVisit;
}

function offlineVisitToVisit(offlineVisit: OfflineVisit) {
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

export function usePatientOrOfflineRegisteredPatient(patientUuid: string): ReturnType<typeof usePatient> {
  const onlinePatientState = usePatient(patientUuid);
  const offlinePatientState = useSWR(`offlineRegisteredPatient/${patientUuid}`, async () => {
    const offlinePatient = await getOfflineRegisteredPatientAsFhirPatient(patientUuid);
    if (!offlinePatient) {
      throw new Error(`No offline registered patient could be found. UUID: ${patientUuid}`);
    }

    return offlinePatient;
  });

  if (onlinePatientState.isLoading || (!offlinePatientState.data && !offlinePatientState.error)) {
    return {
      isLoading: true,
      patient: null,
      patientUuid,
      error: null,
    };
  }

  if (onlinePatientState.patient && !(onlinePatientState.patient as any).issue) {
    return {
      isLoading: false,
      patient: onlinePatientState.patient,
      patientUuid,
      error: null,
    };
  }

  if (offlinePatientState.data) {
    return {
      isLoading: false,
      patient: offlinePatientState.data,
      patientUuid,
      error: null,
    };
  }

  return {
    isLoading: false,
    patient: null,
    patientUuid,
    error: onlinePatientState.error ?? offlinePatientState.error,
  };
}

async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient | undefined> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.fhirPatient.id === patientUuid);
  return patientSyncItem.fhirPatient;
}
