import type { OrderUrgency } from './types';

export * from './useOrderBasket';
export * from './postOrders';
export * from './useOrders';
export * from './types';
export * from './prepFuncs';

type PriorityOption = {
  label: string;
  value: OrderUrgency;
};

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions: PriorityOption[] = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
];
