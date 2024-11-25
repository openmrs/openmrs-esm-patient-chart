import type { OrderBasketItem } from './order';

export interface TestOrderBasketItem extends OrderBasketItem {
  testType: {
    label: string;
    conceptUuid: string;
  };
  orderReason?: string;
  specimenSource?: string;
}
