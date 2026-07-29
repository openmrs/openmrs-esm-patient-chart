import { useMemo } from 'react';
import { createGlobalStore, useStore } from '@openmrs/esm-framework';
import { reviewedStorageKey } from './constants';

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

function readFromStorage(userUuid: string): Record<string, ReviewRecord> {
  try {
    const raw = localStorage.getItem(reviewedStorageKey(userUuid));
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    // Anything other than a plain object (a stale format, a hand-edited value) is discarded rather
    // than allowed to crash the bell.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeToStorage(userUuid: string, reviewed: Record<string, ReviewRecord>) {
  try {
    localStorage.setItem(reviewedStorageKey(userUuid), JSON.stringify(reviewed));
  } catch (error) {
    // A full or unavailable localStorage must not break triage; the review just won't persist.
    console.error('Could not persist smart notification review state', error);
  }
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
  reviewStore.setState({ userUuid, reviewed: userUuid ? readFromStorage(userUuid) : {} });
}

export function markNotificationReviewed(id: string, patientUuid: string, providerDisplay: string) {
  const { userUuid, reviewed } = reviewStore.getState();
  const next = {
    ...reviewed,
    [id]: { providerDisplay, patientUuid, reviewedAt: new Date().toISOString() },
  };
  reviewStore.setState({ reviewed: next });
  if (userUuid) {
    writeToStorage(userUuid, next);
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
