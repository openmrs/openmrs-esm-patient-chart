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

  it('falls back to the most recent observation for the concept when no encounter matches', () => {
    const older = { ...mockNormalObservation, uuid: 'older', encounterUuid: 'encounter-uuid-3' };
    const newer = {
      ...mockNormalObservation,
      uuid: 'newer',
      encounterUuid: 'encounter-uuid-4',
      effectiveDateTime: '2026-06-30T09:30:00.000+0000',
    };

    const joined = joinObservationsToOrders([mockRoutineOrder] as Array<Order>, [older, newer]);

    expect(joined[0].obs?.uuid).toBe('newer');
  });
});
