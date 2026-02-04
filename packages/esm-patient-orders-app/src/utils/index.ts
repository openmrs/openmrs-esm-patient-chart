import {
  assessValue,
  type DrugOrderBasketItem,
  type OBSERVATION_INTERPRETATION,
  type Order,
  type OrderAction,
  type OrderBasketItem,
  type ReferenceRanges,
  type TestOrderBasketItem,
} from '@openmrs/esm-patient-common-lib';
import { type Observation, type ObservationValue } from '../types/encounter';
import { type LabOrderConcept } from '../lab-results/lab-results.resource';

/**
 * Enables a comparison of arbitrary values with support for undefined/null.
 * Requires the `<` and `>` operators to return something reasonable for the provided values.
 */
export function compare<T>(x?: T, y?: T) {
  if (x == undefined && y == undefined) {
    return 0;
  } else if (x == undefined) {
    return -1;
  } else if (y == undefined) {
    return 1;
  } else if (x < y) {
    return -1;
  } else if (x > y) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Builds medication order object from the given order object
 * See also same function in esm-patient-medications-app/src/api/api.ts
 */
export function buildMedicationOrder(order: Order, action?: OrderAction): DrugOrderBasketItem {
  if (!order.drug) {
    throw new Error('Drug order is missing drug information.');
  }

  return {
    display: order.drug.display,
    previousOrder: action !== 'NEW' ? order.uuid : null,
    action: action,
    drug: order.drug,
    dosage: order.dose ?? null,
    unit: order.doseUnits
      ? {
          value: order.doseUnits.display,
          valueCoded: order.doseUnits.uuid,
        }
      : null,
    frequency: order.frequency
      ? {
          valueCoded: order.frequency.uuid,
          value: order.frequency.display,
        }
      : null,
    route: order.route
      ? {
          valueCoded: order.route.uuid,
          value: order.route.display,
        }
      : null,
    commonMedicationName: order.drug.display,
    isFreeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions',
    freeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    patientInstructions: order.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    asNeeded: order.asNeeded,
    asNeededCondition: order.asNeededCondition ?? null,
    startDate: action === 'DISCONTINUE' ? order.dateActivated : new Date(),
    duration: order.duration,
    durationUnit: order.durationUnits
      ? {
          valueCoded: order.durationUnits.uuid,
          value: order.durationUnits.display,
        }
      : null,
    pillsDispensed: order.quantity,
    numRefills: order.numRefills,
    indication: order.orderReasonNonCoded,
    quantityUnits: order.quantityUnits
      ? {
          value: order.quantityUnits.display,
          valueCoded: order.quantityUnits.uuid,
        }
      : null,
    encounterUuid: order.encounter?.uuid,
    visit: order.encounter.visit,
  };
}

/**
 * Builds lab order object from the given order object
 */
export function buildLabOrder(order: Order, action?: OrderAction): TestOrderBasketItem {
  return {
    action: action,
    display: order.display,
    previousOrder: action !== 'NEW' ? order.uuid : null,
    instructions: order.instructions,
    urgency: order.urgency,
    accessionNumber: order.accessionNumber,
    testType: {
      label: order.concept.display,
      conceptUuid: order.concept.uuid,
    },
    orderNumber: order.orderNumber,
    concept: order.concept,
    orderType: order.orderType.uuid,
    specimenSource: null,
    scheduledDate: order.scheduledDate ? new Date(order.scheduledDate) : null,
    encounterUuid: order.encounter?.uuid,
    visit: order.encounter.visit,
  };
}

/**
 * Builds general order object from the given order object
 */
export function buildGeneralOrder(order: Order, action?: OrderAction): OrderBasketItem {
  return {
    action: action,
    display: order.display,
    previousOrder: action !== 'NEW' ? order.uuid : null,
    instructions: order.instructions,
    urgency: order.urgency,
    accessionNumber: order.accessionNumber,
    concept: order.concept,
    orderNumber: order.orderNumber,
    orderType: order.orderType.uuid,
    scheduledDate: order.scheduledDate ? new Date(order.scheduledDate) : null,
    encounterUuid: order.encounter?.uuid,
    visit: order.encounter.visit,
  };
}

/**
 * Utility function to extract display value from ObservationValue
 */
export const getObservationDisplayValue = (value: ObservationValue): string => {
  if (!value) return '--';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value && typeof value === 'object' && 'display' in value) return value.display;
  return '--';
};

/**
 * Maps an OpenMRS REST API Obs.Interpretation enum value to the
 * OBSERVATION_INTERPRETATION type used in the UI.
 * Returns undefined for unrecognized or missing values.
 */
const validInterpretations = new Set<string>([
  'NORMAL',
  'HIGH',
  'CRITICALLY_HIGH',
  'OFF_SCALE_HIGH',
  'LOW',
  'CRITICALLY_LOW',
  'OFF_SCALE_LOW',
]);

export function getObsInterpretation(interpretation?: string): OBSERVATION_INTERPRETATION | undefined {
  if (interpretation && validInterpretations.has(interpretation)) {
    return interpretation as OBSERVATION_INTERPRETATION;
  }
  return undefined;
}

/**
 * Maps an interpretation to a CSS class name from a styles module.
 */
export const getInterpretationClass = (
  styles: Record<string, string>,
  interpretation: OBSERVATION_INTERPRETATION,
): string => {
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return styles['off-scale-high'];
    case 'CRITICALLY_HIGH':
      return styles['critically-high'];
    case 'HIGH':
      return styles['high'];
    case 'OFF_SCALE_LOW':
      return styles['off-scale-low'];
    case 'CRITICALLY_LOW':
      return styles['critically-low'];
    case 'LOW':
      return styles['low'];
    case 'NORMAL':
    default:
      return '';
  }
};

/**
 * Extracts effective ranges, prioritizing API ranges over concept defaults.
 * Returns all threshold fields (normal, critical, absolute) so that
 * assessValue can flag CRITICALLY_HIGH / OFF_SCALE_LOW / etc.
 */
export const getEffectiveRanges = (
  concept: LabOrderConcept,
  referenceRangesMap?: Map<string, ReferenceRanges>,
): ReferenceRanges => {
  const apiRange = referenceRangesMap?.get(concept?.uuid);
  if (apiRange) {
    return {
      ...apiRange,
      units: apiRange.units ?? concept?.units ?? undefined,
    };
  }
  return {
    lowNormal: concept?.lowNormal ?? undefined,
    hiNormal: concept?.hiNormal ?? undefined,
    lowCritical: concept?.lowCritical ?? undefined,
    hiCritical: concept?.hiCritical ?? undefined,
    lowAbsolute: concept?.lowAbsolute ?? undefined,
    hiAbsolute: concept?.hiAbsolute ?? undefined,
    units: concept?.units ?? undefined,
  };
};

/**
 * Collects concept UUIDs for a concept and its set members,
 * for use with useReferenceRanges.
 */
export function getConceptUuids(concept: LabOrderConcept | undefined): Array<string> {
  if (!concept) {
    return [];
  }
  const uuids = [concept.uuid];
  if (concept.setMembers) {
    concept.setMembers.forEach((member) => uuids.push(member.uuid));
  }
  return uuids;
}

export interface InterpretedResult {
  displayValue: string;
  interpretation: OBSERVATION_INTERPRETATION;
}

/**
 * Computes the display value and interpretation for an observation.
 * Prefers the server-assigned interpretation; falls back to client-side
 * assessValue when unavailable.
 */
export function interpretObservation(obs: Observation, ranges: ReferenceRanges): InterpretedResult {
  const displayValue = getObservationDisplayValue(obs.value ?? obs);
  const numericValue = typeof obs.value === 'number' ? obs.value : parseFloat(displayValue);
  const obsInterpretation = getObsInterpretation(obs.interpretation);
  const interpretation = obsInterpretation ?? (!isNaN(numericValue) ? assessValue(numericValue, ranges) : 'NORMAL');
  const units = ranges.units ?? '';
  const valueIsNumeric = typeof obs.value === 'number';
  const valueWithUnits = valueIsNumeric && units ? `${displayValue} ${units}` : displayValue;
  return { displayValue: valueWithUnits, interpretation };
}
