import type { Order } from '@openmrs/esm-patient-common-lib';
import { describe, it, expect } from 'vitest';
import { buildMedicationOrder } from './index';

const medicationOrder = {
  uuid: 'order-uuid',
  action: 'NEW',
  asNeeded: false,
  asNeededCondition: null,
  autoExpireDate: null,
  careSetting: { uuid: 'care-setting-uuid', display: 'Outpatient' },
  commentToFulfiller: '',
  concept: { uuid: 'concept-uuid', display: 'Aspirin' },
  dateActivated: '2026-03-15T08:00:00.000+0000',
  dateStopped: null,
  dispenseAsWritten: false,
  dose: 1,
  doseUnits: { uuid: 'unit-uuid', display: 'tablet' },
  dosingInstructions: 'Take with food',
  dosingType: 'org.openmrs.SimpleDosingInstructions',
  drug: {
    uuid: 'drug-uuid',
    display: 'Aspirin 81 mg',
    strength: '81 mg',
    concept: { uuid: 'concept-uuid', display: 'Aspirin' },
    dosageForm: { uuid: 'dosage-form-uuid', display: 'Tablet' },
  },
  duration: 10,
  durationUnits: { uuid: 'duration-unit-uuid', display: 'Days' },
  encounter: { uuid: 'encounter-uuid', visit: { uuid: 'visit-uuid' } },
  frequency: { uuid: 'frequency-uuid', display: 'Once daily' },
  instructions: null,
  numRefills: 1,
  orderNumber: 'ORD-1',
  orderReason: null,
  orderReasonNonCoded: 'Pain',
  orderType: {
    conceptClasses: [],
    description: '',
    display: 'Drug order',
    name: 'Drug order',
    parent: null,
    retired: false,
    uuid: 'order-type-uuid',
  },
  orderer: {
    display: 'Provider',
    person: { display: 'Provider' },
    uuid: 'provider-uuid',
  },
  patient: { uuid: 'patient-uuid', display: 'Patient' },
  previousOrder: null,
  quantity: 10,
  quantityUnits: { uuid: 'quantity-unit-uuid', display: 'tablet' },
  route: { uuid: 'route-uuid', display: 'Oral' },
  scheduleDate: null,
  urgency: 'ROUTINE',
  accessionNumber: '',
  scheduledDate: '',
  display: 'Aspirin 81 mg',
  auditInfo: {
    creator: { uuid: 'creator-uuid', display: 'Creator' },
    dateCreated: '2026-03-15T08:00:00.000+0000',
    changedBy: '',
    dateChanged: '',
  },
  fulfillerStatus: 'RECEIVED',
  fulfillerComment: '',
  specimenSource: '',
  laterality: '',
  clinicalHistory: '',
  numberOfRepeats: '',
  type: 'drugorder',
} as unknown as Order;

describe('buildMedicationOrder', () => {
  it('defaults RENEW basket items to now instead of the previous activation date', () => {
    const before = Date.now();
    const result = buildMedicationOrder(medicationOrder, 'RENEW');
    const after = Date.now();

    expect(result.scheduledDate).toBeInstanceOf(Date);
    expect((result.scheduledDate as Date).getTime()).toBeGreaterThanOrEqual(before);
    expect((result.scheduledDate as Date).getTime()).toBeLessThanOrEqual(after);
    expect(result.scheduledDate).not.toBe(medicationOrder.dateActivated);
  });

  it('defaults REVISE basket items to now instead of the previous activation or scheduled date', () => {
    const before = Date.now();
    const scheduledDate = '2026-05-01T00:00:00.000+0000';
    const result = buildMedicationOrder({ ...medicationOrder, scheduledDate } as Order, 'REVISE');
    const after = Date.now();

    expect(result.scheduledDate).toBeInstanceOf(Date);
    expect((result.scheduledDate as Date).getTime()).toBeGreaterThanOrEqual(before);
    expect((result.scheduledDate as Date).getTime()).toBeLessThanOrEqual(after);
    expect(result.scheduledDate).not.toBe(scheduledDate);
    expect(result.scheduledDate).not.toBe(medicationOrder.dateActivated);
  });

  it('uses the original activation date when building a DISCONTINUE basket item', () => {
    const result = buildMedicationOrder(medicationOrder, 'DISCONTINUE');

    expect(result.scheduledDate).toBeInstanceOf(Date);
    expect((result.scheduledDate as Date).toISOString()).toBe(new Date(medicationOrder.dateActivated).toISOString());
  });

  it('captures the previous order activation date for REVISE validation', () => {
    const result = buildMedicationOrder(medicationOrder, 'REVISE');

    expect(result.previousOrderDateActivated).toBe(medicationOrder.dateActivated);
  });
});
