import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { readStorageKey } from './constants';
import { readRecordFromStorage, writeRecordToStorage } from './local-storage';

export interface ReadState {
  userUuid: string | null;
  /** Notification id -> ISO timestamp it was opened. */
  read: Record<string, string>;
}

const readStore = createGlobalStore<ReadState>('smart-notifications-read', {
  userUuid: null,
  read: {},
});

/**
 * Points the store at a user and loads that user's read state. Called by the bell as soon as the
 * session is known, alongside `setReviewUser`.
 */
export function setReadUser(userUuid: string) {
  const state = readStore.getState();
  if (state.userUuid === userUuid) {
    return;
  }
  readStore.setState({ userUuid, read: userUuid ? readRecordFromStorage(readStorageKey(userUuid)) : {} });
}

/**
 * Marks a notification as read. This is what opening the detail dialog does: the badge stops
 * counting it, but it stays in the inbox until the clinician marks it reviewed, so nothing is
 * silently dropped just because it was glanced at.
 */
export function markNotificationRead(id: string) {
  const { userUuid, read } = readStore.getState();
  if (read[id]) {
    return;
  }
  const next = { ...read, [id]: new Date().toISOString() };
  readStore.setState({ read: next });
  if (userUuid) {
    writeRecordToStorage(readStorageKey(userUuid), next);
  }
}

export function getReadNotifications(): Record<string, string> {
  return readStore.getState().read;
}

/** Test seam: drops in-memory read state. */
export function _resetReadStore() {
  readStore.setState({ userUuid: null, read: {} });
}

export function useReadNotifications(): Record<string, string> {
  return useStore(readStore).read;
}
