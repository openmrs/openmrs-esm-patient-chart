import { type TestOrderBasketItem, type OrderUrgency } from '@openmrs/esm-patient-common-lib';
import { type OrderableConcept } from './useOrderableConceptSets';

type LabOrderRequest = Pick<TestOrderBasketItem, 'action' | 'testType'>;

type PriorityOption = {
  label: string;
  value: OrderUrgency;
};

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions: PriorityOption[] = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
];
// TODO add priority option `{ value: "ON_SCHEDULED_DATE", label: "On scheduled date" }` once the form supports a date.

export function createEmptyLabOrder(testType: OrderableConcept, orderer: string): TestOrderBasketItem {
  return {
    action: 'NEW',
    urgency: priorityOptions[0].value as OrderUrgency,
    display: testType.label,
    testType,
    orderer,
  };
}

export function ordersEqual(order1: LabOrderRequest, order2: LabOrderRequest) {
  return order1.testType.conceptUuid === order2.testType.conceptUuid && order1.action === order2.action;
}
