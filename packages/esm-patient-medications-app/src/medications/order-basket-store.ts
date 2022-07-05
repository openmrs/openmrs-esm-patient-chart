import { createGlobalStore } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../types/order-basket-item';

export interface OrderBasketStore {
  items: Array<OrderBasketItem>;
  changed: boolean;
}

export interface OrderBasketStoreActions {
  setItems: (value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => void;
  isChanged: (status: boolean) => void;
}

export const orderBasketStore = createGlobalStore<OrderBasketStore>('drug-order-basket', {
  items: [],
  changed: false,
});

export const orderBasketStoreActions = {
  setItems(_: OrderBasketStore, value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) {
    return { items: typeof value === 'function' ? value() : value };
  },
  isChanged(_: OrderBasketStore, status: boolean) {
    return { changed: status };
  },
};
