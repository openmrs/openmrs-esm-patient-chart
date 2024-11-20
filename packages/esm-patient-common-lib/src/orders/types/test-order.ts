import type { OrderBasketItem, OrderUrgency } from './order';

export interface LabOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  urgency?: OrderUrgency;
  instructions?: string;
  previousOrder?: string;
  orderReason?: string;
  orderNumber?: string;
}
