import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Order } from '@openmrs/esm-patient-common-lib';
import {
  mockCriticalObservation,
  mockDeclinedOrder,
  mockFhirObservationBundle,
  mockNormalObservation,
  mockRoutineOrder,
  mockSmartNotificationsEncounterUuid,
  mockStatOrder,
} from '__mocks__';
import { toNotification } from './notification-model';
import { joinObservationsToOrders, toResultedObservation } from './smart-notifications.resource';

describe('toResultedObservation', () => {
  it('maps a FHIR Observation onto the shape the notification rule consumes', () => {
    const resource = mockFhirObservationBundle.entry[0].resource;

    expect(toResultedObservation(resource as never)).toEqual(
      expect.objectContaining({
        uuid: 'obs-uuid-normal',
        conceptUuid: 'concept-creatinine',
        display: 'Serum creatinine',
        value: '1.1',
        units: 'mg/dL',
        effectiveDateTime: '2026-06-29T09:30:00.000+0000',
        ranges: expect.objectContaining({ lowNormal: 0.6, hiNormal: 1.2 }),
      }),
    );
  });

  it('falls back to the concept-level ranges when the observation carries none', () => {
    const resource = { ...mockFhirObservationBundle.entry[0].resource, referenceRange: [] };

    const obs = toResultedObservation(resource as never, { lowNormal: 1, hiNormal: 2, units: 'mg/dL' });

    expect(obs.ranges).toEqual({ lowNormal: 1, hiNormal: 2, units: 'mg/dL' });
  });
});

describe('joinObservationsToOrders', () => {
  const normal = { ...mockNormalObservation, encounterUuid: mockSmartNotificationsEncounterUuid };
  const critical = { ...mockCriticalObservation, encounterUuid: mockSmartNotificationsEncounterUuid };

  it('pairs each order with the observation for the same concept and encounter', () => {
    const joined = joinObservationsToOrders([mockRoutineOrder, mockStatOrder] as Array<Order>, [normal, critical]);

    expect(joined[0].obs?.uuid).toBe('obs-uuid-normal');
    expect(joined[1].obs?.uuid).toBe('obs-uuid-critical');
  });

  it('leaves an order unpaired when no observation matches its concept', () => {
    const joined = joinObservationsToOrders([mockDeclinedOrder] as Array<Order>, [normal]);

    expect(joined[0].obs).toBeUndefined();
  });

  it('prefers the observation from the same encounter over an older one for the same concept', () => {
    const fromAnotherEncounter = {
      ...mockNormalObservation,
      uuid: 'obs-uuid-other-encounter',
      encounterUuid: 'encounter-uuid-2',
      effectiveDateTime: '2026-06-30T09:30:00.000+0000',
    };

    const joined = joinObservationsToOrders([mockRoutineOrder] as Array<Order>, [fromAnotherEncounter, normal]);

    expect(joined[0].obs?.uuid).toBe('obs-uuid-normal');
  });

  it('takes the first result recorded after the order when no encounter matches', () => {
    // The earliest result at or after the order is the one that order produced; a later result for
    // the same concept belongs to whatever was ordered next.
    const first = { ...mockNormalObservation, uuid: 'first', encounterUuid: 'encounter-uuid-3' };
    const later = {
      ...mockNormalObservation,
      uuid: 'later',
      encounterUuid: 'encounter-uuid-4',
      effectiveDateTime: '2026-06-30T09:30:00.000+0000',
    };

    const joined = joinObservationsToOrders([mockRoutineOrder] as Array<Order>, [later, first]);

    expect(joined[0].obs?.uuid).toBe('first');
  });

  it('leaves an order unpaired when every result for the concept predates it', () => {
    const stale = {
      ...mockNormalObservation,
      uuid: 'stale',
      encounterUuid: 'encounter-uuid-old',
      effectiveDateTime: '2026-05-01T09:30:00.000+0000',
    };

    const joined = joinObservationsToOrders([mockRoutineOrder] as Array<Order>, [stale]);

    expect(joined[0].obs).toBeUndefined();
  });
});

/**
 * Guards the rule the whole feature rests on: a lab order notifies only when the clinician opted
 * in, when it was ordered STAT, when the value is critical, or when the sample was rejected.
 * Anything else files silently.
 */
describe('what actually reaches the bell', () => {
  const placedAt = '2026-06-29T09:00:00.000+0000';

  const labOrder = (over: Record<string, unknown> = {}) =>
    ({
      uuid: 'order-glucose',
      concept: { uuid: 'concept-glucose', display: 'Serum glucose' },
      encounter: { uuid: 'encounter-today', location: { uuid: 'loc-1', display: 'Outpatient' } },
      orderNumber: 'ORD-9001',
      orderer: { display: 'Dr. Sarah Smith' },
      patient: { uuid: 'patient-1' },
      dateActivated: placedAt,
      display: 'Serum glucose',
      urgency: 'ROUTINE',
      fulfillerStatus: 'COMPLETED',
      ...over,
    }) as never as Order;

  const inRangeResult = (over: Record<string, unknown> = {}) => ({
    uuid: 'obs-glucose',
    conceptUuid: 'concept-glucose',
    display: 'Serum glucose',
    value: '5',
    units: 'mmol/L',
    ranges: { lowNormal: 4, hiNormal: 7, lowCritical: 2, hiCritical: 25, units: 'mmol/L' },
    effectiveDateTime: '2026-06-29T09:30:00.000+0000',
    encounterUuid: 'encounter-today',
    ...over,
  });

  function derive(orders: Array<Order>, observations: Array<ReturnType<typeof inRangeResult>>, optedIn = false) {
    return joinObservationsToOrders(orders, observations)
      .map(({ order, obs }) => toNotification(order, obs, { notifyOnAbnormalNonCritical: false, optedIn }))
      .filter(Boolean);
  }

  it('stays silent for a routine order the clinician did not opt into', () => {
    expect(derive([labOrder()], [inRangeResult()])).toEqual([]);
  });

  it('notifies for a routine order the clinician opted into', () => {
    expect(derive([labOrder()], [inRangeResult()], true)).toEqual([expect.objectContaining({ tag: 'ROUTINE' })]);
  });

  it('notifies for a STAT order once it has a result', () => {
    expect(derive([labOrder({ urgency: 'STAT' })], [inRangeResult()])).toEqual([
      expect.objectContaining({ tag: 'STAT' }),
    ]);
  });

  it('stays silent for a STAT order that has not been resulted yet', () => {
    expect(derive([labOrder({ urgency: 'STAT' })], [])).toEqual([]);
  });

  it('does not let a result from a previous encounter light up a brand-new order', () => {
    // The regression that made every order notify: a fresh order inheriting last month's result.
    const staleResult = inRangeResult({
      uuid: 'obs-last-month',
      effectiveDateTime: '2026-05-01T09:00:00.000+0000',
      encounterUuid: 'encounter-last-month',
    });

    expect(derive([labOrder({ urgency: 'STAT' })], [staleResult])).toEqual([]);
    expect(derive([labOrder()], [staleResult], true)).toEqual([]);
  });

  it('gives one result to one order when the same test is ordered twice', () => {
    const older = labOrder({ uuid: 'order-first', dateActivated: '2026-06-28T09:00:00.000+0000' });
    const newer = labOrder({ uuid: 'order-second', dateActivated: placedAt });

    const joined = joinObservationsToOrders([older, newer], [inRangeResult()]);

    expect(joined.find((entry) => entry.order.uuid === 'order-second')?.obs?.uuid).toBe('obs-glucose');
    expect(joined.find((entry) => entry.order.uuid === 'order-first')?.obs).toBeUndefined();
  });

  it('still notifies for a critical value on a routine, non-opted-in order', () => {
    // Patient safety overrides the filter, and is not configurable off.
    const critical = inRangeResult({ value: '30' });

    expect(derive([labOrder()], [critical])).toEqual([expect.objectContaining({ tag: 'CRITICAL' })]);
  });

  it('still notifies when the sample was rejected, with no result at all', () => {
    expect(derive([labOrder({ fulfillerStatus: 'DECLINED' })], [])).toEqual([
      expect.objectContaining({ tag: 'SAMPLE_REJECTED' }),
    ]);
  });
});
