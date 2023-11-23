import { type LabOrderBasketItem } from '../api';
import { type TestType } from './useTestTypes';

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
];
// TODO add priority option `{ value: "ON_SCHEDULED_DATE", label: "On scheduled date" }` once the form supports a date.

export function createEmptyLabOrder(testType: TestType, orderer: string): LabOrderBasketItem {
  return {
    action: 'NEW',
    urgency: priorityOptions[0].value,
    display: testType.label,
    testType,
    orderer,
  };
}
