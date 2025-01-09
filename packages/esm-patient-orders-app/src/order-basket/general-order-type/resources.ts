import { translateFrom } from '@openmrs/esm-framework';
import {
  type OrderBasketItem,
  type OrderUrgency,
  type OrderPost,
  type OrderableConcept,
  type PriorityOption,
} from '@openmrs/esm-patient-common-lib';
import { type TOptions } from 'i18next';
import { moduleName } from '../../constants';

const t = (key: string, fallback?: string, options?: Omit<TOptions, 'ns' | 'defaultValue'>) =>
  translateFrom(moduleName, key, fallback, options);

export const priorityOptions: PriorityOption[] = [
  { value: 'ROUTINE', label: t('routine', 'Routine') },
  { value: 'STAT', label: t('stat', 'Stat') },
  { value: 'ON_SCHEDULED_DATE', label: t('onScheduledDate', 'On scheduled date') },
];

export function createEmptyOrder(concept: OrderableConcept, orderer: string): OrderBasketItem {
  return {
    action: 'NEW',
    urgency: priorityOptions[0].value as OrderUrgency,
    display: concept.label,
    concept,
    orderer,
  };
}

export function ordersEqual(order1: OrderBasketItem, order2: OrderBasketItem) {
  return order1.action === order2.action && order1.concept.uuid === order2.concept.uuid;
}

const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

export function prepOrderPostData(
  order: OrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
): OrderPost {
  if (order.action === 'NEW' || order.action === 'RENEW') {
    return {
      action: 'NEW',
      type: 'order',
      patient: patientUuid,
      careSetting: careSettingUuid,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order.concept.uuid,
      instructions: order.instructions,
      // orderReason: order.orderReason,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate,
    };
  } else if (order.action === 'REVISE') {
    return {
      action: 'REVISE',
      type: 'order',
      patient: patientUuid,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order?.concept?.uuid,
      instructions: order.instructions,
      previousOrder: order.previousOrder,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate,
    };
  } else if (order.action === 'DISCONTINUE') {
    return {
      action: 'DISCONTINUE',
      type: 'order',
      patient: patientUuid,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order?.concept?.uuid,
      previousOrder: order.previousOrder,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate,
    };
  } else {
    throw new Error(`Unknown order action: ${order.action}.`);
  }
}
