import type { DrugOrderBasketItem } from './drug-order';
import type { OrderBasketItem } from './order';
import type { LabOrderBasketItem } from './test-order';

export * from './order';
export * from './drug-order';
export * from './test-order';

export type GenericOrderBasketItem = OrderBasketItem | DrugOrderBasketItem | LabOrderBasketItem;
