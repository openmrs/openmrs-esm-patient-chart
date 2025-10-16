import { priorityOptions, type OrderUrgency, type TestOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type TestType } from './useTestTypes';

type LabOrderRequest = Pick<TestOrderBasketItem, 'action' | 'testType'>;

export function createEmptyLabOrder(testType: TestType, orderer: string, visit): TestOrderBasketItem {
  return {
    action: 'NEW',
    urgency: priorityOptions[0].value as OrderUrgency,
    display: testType.label,
    testType,
    orderer,
    visit,
  };
}

export function ordersEqual(order1: LabOrderRequest, order2: LabOrderRequest): boolean {
  return order1.testType.conceptUuid === order2.testType.conceptUuid && order1.action === order2.action;
}
