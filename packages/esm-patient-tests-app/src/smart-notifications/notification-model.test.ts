import { describe, expect, it } from 'vitest';
import { type Order } from '@openmrs/esm-patient-common-lib';
import {
  mockAbnormalObservation,
  mockCriticalObservation,
  mockDeclinedOrder,
  mockNormalObservation,
  mockRoutineOrder,
  mockStatOrder,
} from '__mocks__';
import {
  classifyNotification,
  type ResultedObservation,
  resolveInterpretation,
  sortNotifications,
  toNotification,
} from './notification-model';

const notOptedIn = { notifyOnAbnormalNonCritical: false, optedIn: false };
const optedIn = { notifyOnAbnormalNonCritical: false, optedIn: true };

describe('classifyNotification', () => {
  it('files a routine, in-range, non-opt-in result silently', () => {
    // This is the alert-fatigue guarantee: the common case produces nothing at all.
    expect(classifyNotification(mockRoutineOrder as Order, mockNormalObservation, notOptedIn)).toBeNull();
  });

  it('tags a resulted STAT order as STAT', () => {
    expect(
      classifyNotification(mockStatOrder as Order, { ...mockNormalObservation, ranges: undefined }, notOptedIn),
    ).toBe('STAT');
  });

  it('shows nothing for a STAT order that has not been resulted yet', () => {
    expect(classifyNotification(mockStatOrder as Order, undefined, notOptedIn)).toBeNull();
  });

  it('tags a critical value as CRITICAL even when ordered routine and not opted in', () => {
    expect(classifyNotification(mockRoutineOrder as Order, mockCriticalObservation, notOptedIn)).toBe('CRITICAL');
  });

  it('prefers severity over provenance: a STAT order returning critical is CRITICAL', () => {
    expect(classifyNotification(mockStatOrder as Order, mockCriticalObservation, notOptedIn)).toBe('CRITICAL');
  });

  it('tags an opted-in routine result as ROUTINE', () => {
    expect(classifyNotification(mockRoutineOrder as Order, mockNormalObservation, optedIn)).toBe('ROUTINE');
  });

  it('tags a declined sample as SAMPLE_REJECTED without needing a result', () => {
    expect(classifyNotification(mockDeclinedOrder as Order, undefined, notOptedIn)).toBe('SAMPLE_REJECTED');
  });

  it('ignores abnormal-but-not-critical values by default', () => {
    expect(classifyNotification(mockRoutineOrder as Order, mockAbnormalObservation, notOptedIn)).toBeNull();
  });

  it('notifies for abnormal-but-not-critical values when configured to', () => {
    expect(
      classifyNotification(mockRoutineOrder as Order, mockAbnormalObservation, {
        notifyOnAbnormalNonCritical: true,
        optedIn: false,
      }),
    ).toBe('ROUTINE');
  });

  it.each([['CRITICALLY_HIGH'], ['CRITICALLY_LOW'], ['OFF_SCALE_HIGH'], ['OFF_SCALE_LOW']] as const)(
    'treats a lab-supplied %s interpretation as critical',
    (interpretation) => {
      const obs: ResultedObservation = { ...mockNormalObservation, interpretation, ranges: undefined };
      expect(classifyNotification(mockRoutineOrder as Order, obs, notOptedIn)).toBe('CRITICAL');
    },
  );
});

describe('resolveInterpretation', () => {
  it('prefers an interpretation the lab supplied over one derived from ranges', () => {
    expect(resolveInterpretation({ ...mockNormalObservation, interpretation: 'HIGH' })).toBe('HIGH');
  });

  it('derives the interpretation from reference ranges when the lab supplied none', () => {
    expect(resolveInterpretation(mockCriticalObservation)).toBe('CRITICALLY_LOW');
    expect(resolveInterpretation(mockNormalObservation)).toBe('NORMAL');
    expect(resolveInterpretation(mockAbnormalObservation)).toBe('LOW');
  });

  it('returns undefined for a non-numeric value with no supplied interpretation', () => {
    expect(resolveInterpretation({ ...mockNormalObservation, value: 'Reactive' })).toBeUndefined();
  });

  it('returns undefined when there are no ranges to compare against', () => {
    expect(resolveInterpretation({ ...mockNormalObservation, ranges: undefined })).toBeUndefined();
  });
});

describe('toNotification', () => {
  it('returns null for a result that files silently', () => {
    expect(toNotification(mockRoutineOrder as Order, mockNormalObservation, notOptedIn)).toBeNull();
  });

  it('carries the order and result detail the panel and modal display', () => {
    const notification = toNotification(mockRoutineOrder as Order, mockNormalObservation, optedIn);

    expect(notification).toEqual(
      expect.objectContaining({
        id: 'order-uuid-1:obs-uuid-normal',
        tag: 'ROUTINE',
        testLabel: 'Serum creatinine',
        panelLabel: 'Serum chemistry panel',
        value: '1.1',
        units: 'mg/dL',
        interpretation: 'NORMAL',
        referenceRangeText: '0.6 – 1.2 mg/dL',
        orderNumber: 'ORD-1001',
        ordererDisplay: 'Dr. Sarah Smith',
        locationDisplay: 'Outpatient Triage',
        resultDate: '2026-06-29T09:30:00.000+0000',
      }),
    );
  });

  it('carries the rejection reason for a declined sample', () => {
    const notification = toNotification(mockDeclinedOrder as Order, undefined, notOptedIn);

    expect(notification.tag).toBe('SAMPLE_REJECTED');
    expect(notification.rejectionReason).toBe('Haemolysed sample');
    expect(notification.id).toBe('order-uuid-declined:rejected');
  });
});

describe('sortNotifications', () => {
  it('sorts most severe first, then most recent within a tag', () => {
    const build = (tag, id, resultDate) => ({ tag, id, resultDate }) as never;
    const sorted = sortNotifications([
      build('ROUTINE', 'routine', '2026-06-29T09:00:00.000+0000'),
      build('STAT', 'stat', '2026-06-29T09:00:00.000+0000'),
      build('CRITICAL', 'critical-older', '2026-06-29T08:00:00.000+0000'),
      build('CRITICAL', 'critical-newer', '2026-06-29T10:00:00.000+0000'),
    ]);

    expect(sorted.map((notification) => notification.id)).toEqual([
      'critical-newer',
      'critical-older',
      'stat',
      'routine',
    ]);
  });
});
