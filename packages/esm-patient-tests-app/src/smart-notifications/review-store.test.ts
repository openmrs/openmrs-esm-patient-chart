import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { reviewedStorageKey } from './constants';
import {
  _resetReviewStore,
  getReviewedNotifications,
  markNotificationReviewed,
  setReviewUser,
  useLatestReviewForPatient,
} from './review-store';

const userUuid = 'user-uuid-1';
const patientUuid = 'patient-uuid-1';

describe('review store', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetReviewStore();
  });

  it('persists a review under the signed-in user key', () => {
    setReviewUser(userUuid);
    markNotificationReviewed('notification-1', patientUuid, 'Dr. Sarah Smith');

    const persisted = JSON.parse(localStorage.getItem(reviewedStorageKey(userUuid)));
    expect(persisted['notification-1']).toEqual(
      expect.objectContaining({ providerDisplay: 'Dr. Sarah Smith', patientUuid }),
    );
  });

  it('reloads a user’s reviews from storage when they sign in', () => {
    localStorage.setItem(
      reviewedStorageKey(userUuid),
      JSON.stringify({ 'notification-9': { providerDisplay: 'Dr. Amoit', patientUuid, reviewedAt: '2026-06-29' } }),
    );

    setReviewUser(userUuid);

    expect(getReviewedNotifications()).toHaveProperty('notification-9');
  });

  it('does not leak one user’s reviews to the next user on a shared workstation', () => {
    setReviewUser(userUuid);
    markNotificationReviewed('notification-1', patientUuid, 'Dr. Sarah Smith');

    setReviewUser('user-uuid-2');

    expect(getReviewedNotifications()).toEqual({});
  });

  it('tolerates corrupt storage rather than breaking the bell', () => {
    localStorage.setItem(reviewedStorageKey(userUuid), 'not json');

    setReviewUser(userUuid);

    expect(getReviewedNotifications()).toEqual({});
  });

  it('tolerates a non-object stored value', () => {
    localStorage.setItem(reviewedStorageKey(userUuid), JSON.stringify(['unexpected']));

    setReviewUser(userUuid);

    expect(getReviewedNotifications()).toEqual({});
  });

  it('keeps the review in memory when localStorage refuses the write', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    setReviewUser(userUuid);
    markNotificationReviewed('notification-1', patientUuid, 'Dr. Sarah Smith');

    expect(getReviewedNotifications()).toHaveProperty('notification-1');
    setItem.mockRestore();
  });

  describe('useLatestReviewForPatient', () => {
    it('returns the most recent review for the patient', () => {
      // Pin the clock so the two reviews get distinguishable timestamps.
      vi.useFakeTimers();
      setReviewUser(userUuid);
      vi.setSystemTime(new Date('2026-06-29T09:00:00.000Z'));
      markNotificationReviewed('older', patientUuid, 'Dr. Amoit');
      vi.setSystemTime(new Date('2026-06-29T10:00:00.000Z'));
      markNotificationReviewed('newer', patientUuid, 'Dr. Sarah Smith');

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current.providerDisplay).toBe('Dr. Sarah Smith');
      vi.useRealTimers();
    });

    it('ignores reviews belonging to a different patient', () => {
      setReviewUser(userUuid);
      markNotificationReviewed('other-patient', 'patient-uuid-2', 'Dr. Amoit');

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current).toBeUndefined();
    });

    it('returns undefined without a patient', () => {
      const { result } = renderHook(() => useLatestReviewForPatient(undefined));

      expect(result.current).toBeUndefined();
    });

    it('keeps reporting a review from inside the banner window', () => {
      vi.useFakeTimers();
      setReviewUser(userUuid);
      vi.setSystemTime(new Date('2026-06-29T09:00:00.000Z'));
      markNotificationReviewed('recent', patientUuid, 'Dr. Sarah Smith');
      vi.setSystemTime(new Date('2026-06-29T20:00:00.000Z'));

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current.providerDisplay).toBe('Dr. Sarah Smith');
      vi.useRealTimers();
    });

    it('stops reporting a review once it falls out of the banner window', () => {
      vi.useFakeTimers();
      setReviewUser(userUuid);
      vi.setSystemTime(new Date('2026-06-29T09:00:00.000Z'));
      markNotificationReviewed('stale', patientUuid, 'Dr. Sarah Smith');
      // Two weeks on, with newer unreviewed results likely to have arrived since.
      vi.setSystemTime(new Date('2026-07-13T09:00:00.000Z'));

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current).toBeUndefined();
      vi.useRealTimers();
    });

    it('drops a review whose timestamp will not parse rather than showing it forever', () => {
      setReviewUser(userUuid);
      localStorage.setItem(
        reviewedStorageKey(userUuid),
        JSON.stringify({ broken: { providerDisplay: 'Dr. Amoit', patientUuid, reviewedAt: 'not-a-date' } }),
      );
      _resetReviewStore();
      setReviewUser(userUuid);

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current).toBeUndefined();
    });

    it('carries the test label so the banner can say which result was signed off', () => {
      setReviewUser(userUuid);
      markNotificationReviewed('notification-1', patientUuid, 'Dr. Sarah Smith', 'Serum creatinine');

      const { result } = renderHook(() => useLatestReviewForPatient(patientUuid));

      expect(result.current.testLabel).toBe('Serum creatinine');
    });
  });
});
