import type { OrderBasketItem } from './order';

export interface TestOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  instructions?: string;
  previousOrder?: string;
  orderReason?: string;
  orderNumber?: string;
  specimenSource?: string;
}
