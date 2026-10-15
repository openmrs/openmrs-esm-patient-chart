import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { optInKey, optInStorageKey } from './constants';
import { readRecordFromStorage, writeRecordToStorage } from './local-storage';

/**
 * Value is the ISO timestamp the opt-in was recorded, not a bare `true`.
 *
 * Without it the opt-in is retroactive: keyed only by patient + concept, ticking "Notify me when
 * resulted" once lights up *every* order of that test the fetch returns, including ones placed
 * weeks earlier with the toggle off. The timestamp bounds it to orders placed around or after the
 * choice was made. A legacy `true` from before this change is honoured unbounded rather than
 * silently discarded.
 */
export type OptInRecord = string | boolean;

export interface OptInState {
  userUuid: string | null;
  optIns: Record<string, OptInRecord>;
}

/**
 * Orders placed slightly *before* the opt-in was recorded still count. The direct-post path records
 * the choice in the POST's `.then()`, so the server's `dateActivated` precedes the browser's
 * timestamp — and the two clocks can differ anyway. An hour absorbs both without reaching back to
 * the previous encounter, which is the leak being closed.
 */
const optInGraceMs = 60 * 60 * 1000;

/** Whether an opt-in covers this order, given when the order was placed. */
export function optInCoversOrder(record: OptInRecord | undefined, dateActivated: string | undefined): boolean {
  if (!record) {
    return false;
  }
  // Legacy boolean, or an order with no date to judge: fall back to the old unbounded behaviour
  // rather than dropping a notification the clinician explicitly asked for.
  if (typeof record !== 'string' || !dateActivated) {
    return true;
  }
  const optedInAt = Date.parse(record);
  const placedAt = Date.parse(dateActivated);
  if (Number.isNaN(optedInAt) || Number.isNaN(placedAt)) {
    return true;
  }
  return placedAt >= optedInAt - optInGraceMs;
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
    optIns: userUuid ? readRecordFromStorage<OptInRecord>(optInStorageKey(userUuid)) : {},
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
    persist({ ...optIns, [key]: new Date().toISOString() }, userUuid);
    return;
  }

  if (!optIns[key]) {
    return;
  }
  const next = { ...optIns };
  delete next[key];
  persist(next, userUuid);
}

function persist(optIns: Record<string, OptInRecord>, userUuid: string | null) {
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

export function useOptIns(): Record<string, OptInRecord> {
  return useStore(optInStore).optIns;
}
