/**
 * Backend payloads for the screenshot harness, in the exact shapes the real resource hook parses:
 * the REST `/order` list and a FHIR `Observation` bundle. The harness serves these through a faked
 * `openmrsFetch`, so the notifications in the screenshots are produced by the shipped
 * classification rule rather than hand-authored.
 */

export const harnessPatientUuid = 'betty-bliss-uuid';
export const harnessLocationUuid = 'location-uuid-outpatient';

const encounterUuid = 'encounter-uuid-1';

export const harnessPatient: fhir.Patient = {
  resourceType: 'Patient',
  id: harnessPatientUuid,
  identifier: [
    {
      use: 'usual',
      system: 'OpenMRS ID',
      type: { text: 'OpenMRS ID', coding: [{ code: 'OpenMRS ID' }] },
      value: '100065E',
    },
  ],
  active: true,
  name: [{ use: 'usual', family: 'Bliss', given: ['Betty'] }],
  gender: 'female',
  birthDate: '2000-04-08',
};

function order(overrides: Record<string, unknown>) {
  return {
    action: 'NEW',
    dateActivated: new Date().toISOString(),
    encounter: {
      uuid: encounterUuid,
      location: { uuid: harnessLocationUuid, display: 'Outpatient Triage · Ubuntu Hospital' },
    },
    fulfillerComment: null,
    fulfillerStatus: 'COMPLETED',
    orderer: { uuid: 'provider-uuid-1', display: 'Dr. Sarah Smith', person: { display: 'Dr. Sarah Smith' } },
    patient: { uuid: harnessPatientUuid },
    urgency: 'ROUTINE',
    ...overrides,
  };
}

function normalRange(low: number, high: number) {
  return {
    low: { value: low },
    high: { value: high },
    type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning', code: 'normal' }] },
  };
}

function criticalRange(low: number, high: number) {
  return {
    low: { value: low },
    high: { value: high },
    type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning', code: 'treatment' }] },
  };
}

function observation(overrides: Record<string, unknown>) {
  return {
    resource: {
      resourceType: 'Observation',
      encounter: { reference: `Encounter/${encounterUuid}`, type: 'Encounter' },
      effectiveDateTime: new Date().toISOString(),
      issued: new Date().toISOString(),
      ...overrides,
    },
  };
}

/** Routine order, in-range result — notifies only because the clinician opted in. */
const creatinineOrder = order({
  uuid: 'order-uuid-creatinine',
  concept: { uuid: 'concept-creatinine', display: 'Serum Creatinine' },
  display: 'Serum Creatinine',
  orderNumber: 'ORD-1001',
});

const creatinineObs = observation({
  id: 'obs-uuid-creatinine',
  code: { coding: [{ code: 'concept-creatinine', display: 'Serum Creatinine' }], text: 'Serum Creatinine' },
  valueQuantity: { value: 1.1, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' },
  referenceRange: [normalRange(0.6, 1.2), criticalRange(0.2, 4)],
});

/** Routine order, critically low result — notifies on safety grounds regardless of how it was ordered. */
const haemoglobinOrder = order({
  uuid: 'order-uuid-haemoglobin',
  concept: { uuid: 'concept-haemoglobin', display: 'Haemoglobin' },
  display: 'Haemoglobin',
  orderNumber: 'ORD-1002',
});

const haemoglobinObs = observation({
  id: 'obs-uuid-haemoglobin',
  code: { coding: [{ code: 'concept-haemoglobin', display: 'Haemoglobin' }], text: 'Haemoglobin' },
  valueQuantity: { value: 4.1, unit: 'g/dL', system: 'http://unitsofmeasure.org', code: 'g/dL' },
  referenceRange: [normalRange(12, 14), criticalRange(5, 20)],
});

/** STAT order, abnormal-but-not-critical result — notifies because of the urgency. */
const alpOrder = order({
  uuid: 'order-uuid-alp',
  concept: { uuid: 'concept-alp', display: 'Alkaline phosphatase' },
  display: 'Alkaline phosphatase',
  orderNumber: 'ORD-1003',
  urgency: 'STAT',
});

const alpObs = observation({
  id: 'obs-uuid-alp',
  code: { coding: [{ code: 'concept-alp', display: 'Alkaline phosphatase' }], text: 'Alkaline phosphatase' },
  valueQuantity: { value: 150, unit: 'U/L', system: 'http://unitsofmeasure.org', code: 'U/L' },
  referenceRange: [normalRange(35, 147), criticalRange(20, 400)],
});

/**
 * Routine order, in-range result, no opt-in — the alert-fatigue control. This one must never appear
 * in the inbox, in any scenario.
 */
const glucoseOrder = order({
  uuid: 'order-uuid-glucose',
  concept: { uuid: 'concept-glucose', display: 'Serum glucose' },
  display: 'Serum glucose',
  orderNumber: 'ORD-1004',
});

const glucoseObs = observation({
  id: 'obs-uuid-glucose',
  code: { coding: [{ code: 'concept-glucose', display: 'Serum glucose' }], text: 'Serum glucose' },
  valueQuantity: { value: 5.2, unit: 'mmol/L', system: 'http://unitsofmeasure.org', code: 'mmol/L' },
  referenceRange: [normalRange(4, 7), criticalRange(2, 20)],
});

export const scenarios = {
  /** One opted-in routine result, plus a silent routine result that must not surface. */
  single: {
    optIns: ['concept-creatinine'],
    orders: [creatinineOrder, glucoseOrder],
    observations: [creatinineObs, glucoseObs],
  },
  /** All three triggers at once, to show the severity ranking. */
  triage: {
    optIns: ['concept-creatinine'],
    orders: [haemoglobinOrder, alpOrder, creatinineOrder, glucoseOrder],
    observations: [haemoglobinObs, alpObs, creatinineObs, glucoseObs],
  },
  /** Nothing needs attention — every result filed silently. */
  quiet: {
    optIns: [],
    orders: [glucoseOrder],
    observations: [glucoseObs],
  },
} as const;

export type ScenarioName = keyof typeof scenarios;
