import { useStoreWithActions } from '@openmrs/esm-framework';
import type { OrderBasketItem, PostDataPrepFunction } from './types';
import { getPatientUuidFromUrl } from '../get-patient-uuid-from-url';
import { useEffect } from 'react';
import { OrderBasketStore, orderBasketStore } from './store';

const orderBasketStoreActions = {
  setOrderBasketItems(
    state: OrderBasketStore,
    grouping: string,
    value: Array<OrderBasketItem> | (() => Array<OrderBasketItem>),
  ) {
    const patientUuid = getPatientUuidFromUrl();
    if (!Object.keys(state.postDataPrepFunctions).includes(grouping)) {
      console.warn(`Programming error: You must register a postDataPrepFunction for grouping ${grouping} `);
    }
    return {
      items: {
        ...state?.items,
        [patientUuid]: {
          [grouping]: typeof value === 'function' ? value() : value,
        },
      },
    };
  },
  setPostDataPrepFunctionForGrouping(state: OrderBasketStore, grouping: string, value: PostDataPrepFunction) {
    return {
      postDataPrepFunctions: {
        ...state.postDataPrepFunctions,
        [grouping]: value,
      },
    };
  }
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
 * @param postDataPrepFunction A function that will be called on each order before it is posted to the server.
 *  A PostDataPrepFunction must be provided for each grouping, but does not necessarily have to be provided
 *  in every usage of useOrderBasket with a grouping key.
 */
export function useOrderBasket(): UseOrderBasketReturn<void>;
export function useOrderBasket(grouping: string): UseOrderBasketReturn<string>;
export function useOrderBasket(grouping: string, postDataPrepFunction: PostDataPrepFunction): UseOrderBasketReturn<string>;
export function useOrderBasket(grouping?: string | null, postDataPrepFunction?: PostDataPrepFunction): UseOrderBasketReturn<string | void> {
  const { items, postDataPrepFunctions, setOrderBasketItems, setPostDataPrepFunctionForGrouping } = useStoreWithActions(orderBasketStore, orderBasketStoreActions);
  const orders = getOrderItems(items, grouping);

  useEffect(() => {
    if (postDataPrepFunction && !postDataPrepFunctions[grouping]) {
      setPostDataPrepFunctionForGrouping(grouping, postDataPrepFunction);
    }
  }, []);

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
