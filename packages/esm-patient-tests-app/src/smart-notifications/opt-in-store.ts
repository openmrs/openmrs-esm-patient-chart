import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { optInKey, optInStorageKey } from './constants';
import { readRecordFromStorage, writeRecordToStorage } from './local-storage';

export interface OptInState {
  userUuid: string | null;
  optIns: Record<string, boolean>;
}

const optInStore = createGlobalStore<OptInState>('smart-notifications-opt-in', {
  userUuid: null,
  optIns: {},
});

/**
 * Points the store at a user and loads that user's opt-ins. Called by the bell as soon as the
 * session is known, alongside `setReviewUser` and `setReadUser`, and by the order form before it
 * can record a choice.
 */
export function setOptInUser(userUuid: string) {
  const state = optInStore.getState();
  if (state.userUuid === userUuid) {
    return;
  }
  optInStore.setState({
    userUuid,
    optIns: userUuid ? readRecordFromStorage<boolean>(optInStorageKey(userUuid)) : {},
  });
}

/**
 * Records (or clears) the clinician's "Notify me when resulted" choice, against whoever the store is
 * currently pointed at.
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
  const { userUuid, optIns } = optInStore.getState();

  if (optedIn) {
    if (optIns[key]) {
      return;
    }
    persist({ ...optIns, [key]: true }, userUuid);
    return;
  }

  if (!optIns[key]) {
    return;
  }
  const next = { ...optIns };
  delete next[key];
  persist(next, userUuid);
}

function persist(optIns: Record<string, boolean>, userUuid: string | null) {
  optInStore.setState({ optIns });
  if (userUuid) {
    writeRecordToStorage(optInStorageKey(userUuid), optIns);
  }
}

export function isOptedIn(patientUuid: string, conceptUuid: string): boolean {
  return Boolean(optInStore.getState().optIns[optInKey(patientUuid, conceptUuid)]);
}

/** Test seam: drops in-memory opt-in state. */
export function _resetOptInStore() {
  optInStore.setState({ userUuid: null, optIns: {} });
}

export function useOptIns(): Record<string, boolean> {
  return useStore(optInStore).optIns;
}
