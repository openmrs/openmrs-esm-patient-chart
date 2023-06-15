import { createGlobalStore } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../types/order-basket-item';

function getPatientUuidFromUrl(): string {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  return match && match[1];
}
export interface OrderBasketStore {
  items: {
    [patientUuid: string]: Array<OrderBasketItem>;
  };
}

export interface OrderBasketStoreActions {
  setOrderBasketItems: (value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => void;
}

export const orderBasketStore = createGlobalStore<OrderBasketStore>('drug-order-basket', {
  items: {},
});

export const orderBasketStoreActions = {
  setOrderBasketItems(value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) {
    const patientUuid = getPatientUuidFromUrl();
    orderBasketStore.setState((state) => ({
      items: {
        ...state.items,
        [patientUuid]: typeof value === 'function' ? value() : value,
      },
    }));
  },
};

export function getOrderItems(items: OrderBasketStore['items'], patientUuid: string): Array<OrderBasketItem> {
  return items?.[patientUuid] ?? [];
}
