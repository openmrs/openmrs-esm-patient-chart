import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { optInKey, optInStorageKey } from './constants';
import { readRecordFromStorage, writeRecordToStorage } from './local-storage';

export interface OptInState {
  optIns: Record<string, boolean>;
}

const optInStore = createGlobalStore<OptInState>('smart-notifications-opt-in', {
  optIns: readRecordFromStorage<boolean>(optInStorageKey),
});

/**
 * Records (or clears) the clinician's "Notify me when resulted" choice.
 *
 * The opt-in is concept-level, not order-level: OpenMRS core has no order attribute to carry it and
 * the order basket's grouped submit can't smuggle a custom flag into the POST. Ordering the same
 * test twice therefore makes both results notify — deliberately erring toward notifying.
 */
export function setOptIn(patientUuid: string, conceptUuid: string, optedIn: boolean) {
  if (!patientUuid || !conceptUuid) {
    return;
  }

  const key = optInKey(patientUuid, conceptUuid);
  const { optIns } = optInStore.getState();

  if (optedIn) {
    if (optIns[key]) {
      return;
    }
    const next = { ...optIns, [key]: true };
    optInStore.setState({ optIns: next });
    writeRecordToStorage(optInStorageKey, next);
    return;
  }

  if (!optIns[key]) {
    return;
  }
  const next = { ...optIns };
  delete next[key];
  optInStore.setState({ optIns: next });
  writeRecordToStorage(optInStorageKey, next);
}

export function isOptedIn(patientUuid: string, conceptUuid: string): boolean {
  return Boolean(optInStore.getState().optIns[optInKey(patientUuid, conceptUuid)]);
}

/** Test seam: drops in-memory opt-in state. */
export function _resetOptInStore() {
  optInStore.setState({ optIns: {} });
}

export function useOptIns(): Record<string, boolean> {
  return useStore(optInStore).optIns;
}
