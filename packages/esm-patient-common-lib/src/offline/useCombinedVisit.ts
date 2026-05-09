import { useConnectivity, useVisit } from '@openmrs/esm-framework';
import { useOfflineVisit } from './visit';

/**
 * Merges the server-side active visit with any offline-queued visit,
 * so the patient chart always shows ongoing visits regardless of connectivity.
 */
export function useCombinedVisit(patientUuid: string) {
  const isOnline = useConnectivity();
  const onlineVisit = useVisit(patientUuid);
  const offlineVisit = useOfflineVisit(patientUuid);

  // If online and server has an active visit, prefer it
  if (isOnline && onlineVisit.activeVisit) {
    return onlineVisit;
  }

  // If there's an offline visit (queued, not yet synced), surface it
  if (offlineVisit.activeVisit) {
    return {
      ...offlineVisit,
      // Keep online mutate so SWR can revalidate after sync
      mutate: onlineVisit.mutate ?? offlineVisit.mutate,
    };
  }

  // Fallback to online result (may be null)
  return onlineVisit;
}
