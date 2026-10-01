import { priorityOptions, type OrderUrgency, type TestOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type TestType } from './useTestTypes';

type LabOrderRequest = Pick<TestOrderBasketItem, 'action' | 'testType'>;

/**
 * A test order plus the clinician's "Notify me when resulted" choice.
 *
 * The flag is local to this app rather than added to the shared `TestOrderBasketItem`: it never
 * reaches the server. OpenMRS core has no order-level notify field, so the opt-in is recorded
 * client-side against patient + concept when the basket is submitted.
 */
export interface SmartTestOrderBasketItem extends TestOrderBasketItem {
  notifyWhenResulted?: boolean;
}

export function createEmptyLabOrder(testType: TestType, orderer: string, visit): SmartTestOrderBasketItem {
  return {
    action: 'NEW',
    urgency: priorityOptions[0].value as OrderUrgency,
    display: testType.label,
    notifyWhenResulted: false,
    testType,
    visit,
  };
}

export function ordersEqual(order1: LabOrderRequest, order2: LabOrderRequest): boolean {
  return order1.testType.conceptUuid === order2.testType.conceptUuid && order1.action === order2.action;
}
