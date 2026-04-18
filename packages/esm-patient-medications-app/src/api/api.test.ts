import { toOmrsIsoString } from '@openmrs/esm-framework';
import { prepMedicationOrderPostData, buildMedicationOrder } from './api';
import type { DrugOrderBasketItem, Order } from '@openmrs/esm-patient-common-lib';

const startDate = new Date('2026-04-01T10:15:00.000Z');

const drugOrderBasketItem: DrugOrderBasketItem = {
  action: 'NEW',
  display: 'Aspirin 81 mg',
  drug: {
    uuid: 'drug-uuid',
    display: 'Aspirin 81 mg',
    strength: '81 mg',
    concept: {
      uuid: 'concept-uuid',
      display: 'Aspirin',
    },
    dosageForm: {
      uuid: 'dosage-form-uuid',
      display: 'Tablet',
    },
  },
  unit: {
    value: 'tablet',
    valueCoded: 'unit-uuid',
  },
  commonMedicationName: 'Aspirin 81 mg',
  dosage: 1,
  frequency: {
    value: 'Once daily',
    valueCoded: 'frequency-uuid',
    frequencyPerDay: 1,
  },
  route: {
    value: 'Oral',
    valueCoded: 'route-uuid',
  },
  quantityUnits: {
    value: 'tablet',
    valueCoded: 'quantity-unit-uuid',
  },
  patientInstructions: 'Take with food',
  asNeeded: false,
  asNeededCondition: null,
  startDate,
  durationUnit: {
    value: 'Days',
    valueCoded: 'duration-unit-uuid',
  },
  duration: 10,
  pillsDispensed: 10,
  numRefills: 1,
  indication: 'Pain',
  isFreeTextDosage: false,
  freeTextDosage: '',
  visit: { uuid: 'visit-uuid' } as Order['encounter']['visit'],
};

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

describe('prepMedicationOrderPostData', () => {
  it.each(['NEW', 'RENEW', 'REVISE'] as const)('includes the selected start date for %s orders', (action) => {
    const result = prepMedicationOrderPostData(
      { ...drugOrderBasketItem, action, previousOrder: action === 'NEW' ? undefined : 'previous-order-uuid' },
      'patient-uuid',
      'encounter-uuid',
      'provider-uuid',
    );

    expect(result.dateActivated).toBe(toOmrsIsoString(startDate));
  });
});

describe('buildMedicationOrder', () => {
  it.each(['RENEW', 'REVISE', 'DISCONTINUE'] as const)(
    'preserves the original activation date when building a %s basket item',
    (action) => {
      const result = buildMedicationOrder(medicationOrder, action);

      expect(result.startDate).toBe(medicationOrder.dateActivated);
    },
  );
});
