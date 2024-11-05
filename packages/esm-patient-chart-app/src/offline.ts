import {
  fhirBaseUrl,
  messageOmrsServiceWorker,
  restBaseUrl,
  saveVisit,
  setupOfflineSync,
} from '@openmrs/esm-framework';
import { type OfflineVisit, visitSyncType } from '@openmrs/esm-patient-common-lib';

export function setupCacheableRoutes() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/R4/Patient/.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/visit.+`,
  });
}

/**
 * Sets up the offline synchronization for offline visits.
 */
export function setupOfflineVisitsSync() {
  setupOfflineSync<OfflineVisit>(visitSyncType, ['patient-registration'], async (visit, options) => {
    const visitPayload = {
      ...visit,
      stopDatetime: new Date(),
    };

    const res = await saveVisit(visitPayload, options.abort);
    if (!res.ok) {
      throw new Error(
        `Failed to synchronize offline visit with the UUID: ${visit.uuid}. Error: ${JSON.stringify(res.data)}`,
      );
    }

    return res.data;
  });
}
