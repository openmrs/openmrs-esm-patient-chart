import { NewVisitPayload, Visit } from '@openmrs/esm-api';
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
} from '@openmrs/esm-framework';
import { useEffect } from 'react';
import { v4 } from 'uuid';

interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}

const visitSyncType = 'visit';

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
  setupOfflineSync<OfflineVisit>(visitSyncType, [], async (visit, options) => {
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
  const offlineVisit: OfflineVisit = {
    uuid: v4(),
    patient: patientUuid,
    startDatetime: new Date(),
    location,
    // TODO: This UUID belongs to the "Facility Visit" type.
    //       This should be replaced with the dedicated offline visit as soon as it exists in the BE.
    visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
  };

  const descriptor: QueueItemDescriptor = {
    id: offlineVisit.uuid,
    dependencies: [],
  };

  await queueSynchronizationItem(visitSyncType, offlineVisit, descriptor);
  return offlineVisit;
}

function offlineVisitToVisit(offlineVisit: OfflineVisit) {
  return {
    uuid: offlineVisit.uuid,
    startDatetime: offlineVisit.startDatetime.toString(),
    stopDatetime: offlineVisit.stopDatetime.toString(),
    encounters: [],
    visitType: {
      uuid: offlineVisit.visitType,
      display: 'OFFLINE_VISIT_PLACEHOLDER',
    },
    patient: {
      uuid: offlineVisit.patient,
    },
  };
}
