import { createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import type { OrderBasketItem } from '../../../esm-patient-orders-app/src/types/order-basket-item';
import { getPatientUuidFromUrl } from '../get-patient-uuid-from-url';
import { useRef } from 'react';

// The order basket holds order information for each patient. The orders are grouped by `key`
// so that different parts of the application may manage their own order lists. For example,
// the medication order list might be grouped as `medications`, and might be managed by the
// medication order basket panel.
interface OrderBasketStore {
  items: {
    [patientUuid: string]: {
      [grouping: string]: Array<OrderBasketItem>;
    };
  };
}

const orderBasketStore = createGlobalStore<OrderBasketStore>('order-basket', {
  items: {},
});

const orderBasketStoreActions = {
  setOrderBasketItems(
    state: OrderBasketStore,
    grouping: string,
    value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>),
  ) {
    const patientUuid = getPatientUuidFromUrl();
    return {
      items: {
        ...state?.items,
        [patientUuid]: {
          [grouping]: typeof value === 'function' ? value() : value,
        },
      },
    };
  },
};

function getOrderItems(items: OrderBasketStore['items'], grouping?: string | null): Array<OrderBasketItem> {
  const patientUuid = getPatientUuidFromUrl();
  const patientItems = items?.[patientUuid] ?? {};
  return grouping ? patientItems[grouping] ?? [] : Object.values(patientItems).flat();
}

export interface ClearOrdersOptions {
  exceptThoseMatching: (order: OrderBasketItem) => boolean;
}

function clearOrders(options?: ClearOrdersOptions) {
  const exceptThoseMatchingFcn = options?.exceptThoseMatching ?? (() => false);
  const patientUuid = getPatientUuidFromUrl();
  const items = orderBasketStore.getState().items;
  const patientItems = items[patientUuid] ?? {};
  const newPatientItems = Object.fromEntries(
    Object.entries(patientItems).map(([grouping, orders]) => [grouping, orders.filter(exceptThoseMatchingFcn)]),
  );
  orderBasketStore.setState((state) => ({
    items: {
      ...state.items,
      [patientUuid]: newPatientItems,
    },
  }));
}

type UseOrderBasketReturn<T> = {
  orders: Array<OrderBasketItem>;
  clearOrders: (options?: ClearOrdersOptions) => void;
  setOrders: T extends string
    ? (value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => void
    : (groupingKey: string, value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => void;
};

/**
 * Allows components to read and write to the order basket.
 *
 * @param grouping: The grouping key for the order basket items. If not provided, `orders` will contain
 *  all order basket items for the current patient, and `setOrders` will require grouping as a parameter.
 */
export function useOrderBasket(): UseOrderBasketReturn<void>;
export function useOrderBasket(grouping: string): UseOrderBasketReturn<string>;
export function useOrderBasket(grouping?: string | null): UseOrderBasketReturn<string | void> {
  const { items, setOrderBasketItems } = useStoreWithActions(orderBasketStore, orderBasketStoreActions);
  const orders = getOrderItems(items, grouping);

  if (typeof grouping === 'string') {
    const setOrders = (value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => {
      return setOrderBasketItems(grouping, value);
    };
    return { orders, clearOrders, setOrders } as UseOrderBasketReturn<string>;
  } else {
    const setOrders = (groupingKey: string, value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>)) => {
      setOrderBasketItems(groupingKey, value);
    };
    return { orders, clearOrders, setOrders } as UseOrderBasketReturn<void>;
  }
}
