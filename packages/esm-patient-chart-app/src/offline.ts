import { NewVisitPayload, Visit } from '@openmrs/esm-api';
import {
  getStartedVisit,
  getSynchronizationItems,
  messageOmrsServiceWorker,
  queueSynchronizationItem,
  saveVisit,
  setupOfflineSync,
  subscribeConnectivityChanged,
  VisitMode,
  VisitStatus,
  generateOfflineUuid,
} from '@openmrs/esm-framework';
import { useEffect } from 'react';

interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}

const visitSyncType = 'visit';

export function setupOfflineVisitsSync() {
  setupOfflineSync<OfflineVisit>(visitSyncType, [], async (item, options) => {
    const { uuid, ...visit } = item;
    await saveVisit(visit, options.abort);
  });
}

export function setupCacheableRoutes() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/openmrs/ws/fhir2/R4/Patient/.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/visit.+',
  });
}

export function useOfflineVisitForPatient(patientUuid?: string, location?: string) {
  useEffect(() => {
    return subscribeConnectivityChanged(async ({ online }) => {
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
    uuid: generateOfflineUuid(),
    patient: patientUuid,
    startDatetime: new Date(),
    location,
    visitType: undefined,
  };

  await queueSynchronizationItem(visitSyncType, offlineVisit);
  return offlineVisit;
}

function offlineVisitToVisit(offlineVisit: OfflineVisit): Visit {
  return {
    uuid: offlineVisit.uuid,
    startDatetime: offlineVisit.startDatetime,
    stopDatetime: offlineVisit.stopDatetime,
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
