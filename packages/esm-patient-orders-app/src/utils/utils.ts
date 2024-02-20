import { type DrugOrderBasketItem, type Order, type OrderAction } from '@openmrs/esm-patient-common-lib';

export function orderPriorityToColor(priority) {
  switch (priority) {
    case 'URGENT':
      return '#FCD6D9';
    case 'ROUTINE':
      return '#A7EFBB';
    default:
      return 'grey';
  }
}

export function orderStatusColor(status) {
  switch (status) {
    case 'RECEIVED':
      return 'blue';
    case 'IN_PROGRESS':
      return 'cyan';
    case 'ON_HOLD':
      return 'teal';
    case 'EXCEPTION':
      return 'magenta';
    case 'COMPLETED':
      return 'green';
    case 'DISCONTINUED':
    case 'DECLINED':
      return 'red';
    default:
      return 'gray';
  }
}

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
 */
export function buildMedicationOrder(order: Order, action?: OrderAction): DrugOrderBasketItem {
  return {
    uuid: order.uuid,
    display: order.drug?.display,
    previousOrder: null,
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
    startDate: order.dateActivated,
    duration: order.duration,
    durationUnit: {
      valueCoded: order.durationUnits?.uuid,
      value: order.durationUnits?.display,
    },
    pillsDispensed: order.quantity,
    numRefills: order.numRefills,
    indication: order.orderReasonNonCoded,
    orderer: order.orderer.uuid,
    careSetting: order.careSetting.uuid,
    quantityUnits: {
      value: order.quantityUnits?.display,
      valueCoded: order.quantityUnits?.uuid,
    },
  };
}

/**
 * Builds lab order object from the given order object
 */
export function buildLabOrder(order: Order, action?: OrderAction) {
  let previousOrder = null;
  if (action === 'REVISE' || action === 'DISCONTINUE') {
    previousOrder = order.uuid;
  }
  return {
    uuid: order.uuid,
    action: action,
    display: order.display,
    previousOrder: previousOrder,
    orderer: order.orderer.uuid,
    careSetting: order.careSetting.uuid,
    instructions: order.instructions,
    urgency: order.urgency,
    labReferenceNumber: order.labReferenceNumber,
    testType: {
      label: order.concept.display,
      conceptUuid: order.concept.uuid,
    },
    orderNumber: order.orderNumber,
    concept: order.concept.uuid,
    orderType: order.orderType.uuid,
    specimenSource: null,
  };
}
