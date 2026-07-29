import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { optInKey, optInStorageKey } from './constants';

export interface OptInState {
  optIns: Record<string, boolean>;
}

function readFromStorage(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(optInStorageKey);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const optInStore = createGlobalStore<OptInState>('smart-notifications-opt-in', { optIns: readFromStorage() });

function persist(optIns: Record<string, boolean>) {
  try {
    localStorage.setItem(optInStorageKey, JSON.stringify(optIns));
  } catch (error) {
    console.error('Could not persist smart notification opt-in state', error);
  }
}

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
    persist(next);
    return;
  }

  if (!optIns[key]) {
    return;
  }
  const next = { ...optIns };
  delete next[key];
  optInStore.setState({ optIns: next });
  persist(next);
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
