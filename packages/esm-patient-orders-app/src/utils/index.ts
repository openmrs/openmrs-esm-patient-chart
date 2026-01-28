import {
  type DrugOrderBasketItem,
  type TestOrderBasketItem,
  type Order,
  type OrderAction,
  type OrderBasketItem,
} from '@openmrs/esm-patient-common-lib';
import { type ObservationValue } from '../types/encounter';
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
  return {
    display: order.drug?.display,
    previousOrder: action !== 'NEW' ? order.uuid : null,
    action: action,
    drug: order.drug,
    dosage: order.dose,
    unit: {
      value: order.doseUnits?.display,
      valueCoded: order.doseUnits?.uuid,
    },
    frequency: {
      valueCoded: order.frequency?.uuid,
      value: order.frequency?.display,
    },
    route: {
      valueCoded: order.route?.uuid,
      value: order.route?.display,
    },
    commonMedicationName: order.drug?.display,
    isFreeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions',
    freeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    patientInstructions: order.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    asNeeded: order.asNeeded,
    asNeededCondition: order.asNeededCondition,
    startDate: action === 'DISCONTINUE' ? order.dateActivated : new Date(),
    duration: order.duration,
    durationUnit: {
      valueCoded: order.durationUnits?.uuid,
      value: order.durationUnits?.display,
    },
    pillsDispensed: order.quantity,
    numRefills: order.numRefills,
    indication: order.orderReasonNonCoded,
    quantityUnits: {
      value: order.quantityUnits?.display,
      valueCoded: order.quantityUnits?.uuid,
    },
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
 * Extracts effective ranges, prioritizing API ranges over concept defaults
 */
export const getEffectiveRanges = (
  concept: LabOrderConcept,
  referenceRangesMap?: Map<string, { lowNormal?: number; hiNormal?: number }>,
) => {
  const apiRange = referenceRangesMap?.get(concept?.uuid);
  if (apiRange) {
    return {
      lowNormal: apiRange.lowNormal,
      hiNormal: apiRange.hiNormal,
    };
  }
  return {
    lowNormal: concept?.lowNormal,
    hiNormal: concept?.hiNormal,
  };
};
