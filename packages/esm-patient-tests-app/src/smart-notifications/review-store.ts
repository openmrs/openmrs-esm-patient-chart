import { useMemo } from 'react';
import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { reviewedStorageKey } from './constants';
import { readRecordFromStorage, writeRecordToStorage } from './local-storage';

export interface ReviewRecord {
  /** Denormalised so the "Result reviewed" banner can name the reviewer without a provider lookup. */
  providerDisplay: string;
  reviewedAt: string;
  patientUuid: string;
}

export interface ReviewState {
  userUuid: string | null;
  reviewed: Record<string, ReviewRecord>;
}

const reviewStore = createGlobalStore<ReviewState>('smart-notifications-review', {
  userUuid: null,
  reviewed: {},
});

/**
 * Points the store at a user and loads that user's review state. Called by the bell as soon as the
 * session is known, so a shared workstation doesn't show one clinician's triage to the next.
 */
export function setReviewUser(userUuid: string) {
  const state = reviewStore.getState();
  if (state.userUuid === userUuid) {
    return;
  }
  reviewStore.setState({
    userUuid,
    reviewed: userUuid ? readRecordFromStorage<ReviewRecord>(reviewedStorageKey(userUuid)) : {},
  });
}

export function markNotificationReviewed(id: string, patientUuid: string, providerDisplay: string) {
  const { userUuid, reviewed } = reviewStore.getState();
  const next = {
    ...reviewed,
    [id]: { providerDisplay, patientUuid, reviewedAt: new Date().toISOString() },
  };
  reviewStore.setState({ reviewed: next });
  if (userUuid) {
    writeRecordToStorage(reviewedStorageKey(userUuid), next);
  }
}

export function getReviewedNotifications(): Record<string, ReviewRecord> {
  return reviewStore.getState().reviewed;
}

/** Test seam: drops in-memory review state. */
export function _resetReviewStore() {
  reviewStore.setState({ userUuid: null, reviewed: {} });
}

export function useReviewedNotifications(): Record<string, ReviewRecord> {
  return useStore(reviewStore).reviewed;
}

/**
 * The most recent review for a patient, which is what the Results dashboard banner shows after
 * "View in chart" brings the clinician over from the inbox.
 */
export function useLatestReviewForPatient(patientUuid: string): ReviewRecord | undefined {
  const reviewed = useReviewedNotifications();

  return useMemo(() => {
    if (!patientUuid) {
      return undefined;
    }
    return Object.values(reviewed)
      .filter((record) => record.patientUuid === patientUuid)
      .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))[0];
  }, [patientUuid, reviewed]);
}
