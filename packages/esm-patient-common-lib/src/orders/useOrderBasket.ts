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
          ...state?.items?.[patientUuid],
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

type UseOrderBasketReturn<T, U> = {
  orders: Array<T>;
  clearOrders: (options?: ClearOrdersOptions) => void;
  setOrders: U extends string
    ? (value: Array<T> | (() => Array<T>)) => void
    : (groupingKey: string, value: Array<T> | (() => Array<T>)) => void;
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
export function useOrderBasket<T extends OrderBasketItem>(): UseOrderBasketReturn<T, void>;
export function useOrderBasket<T extends OrderBasketItem>(grouping: string): UseOrderBasketReturn<T, string>;
export function useOrderBasket<T extends OrderBasketItem>(
  grouping: string,
  postDataPrepFunction: PostDataPrepFunction,
): UseOrderBasketReturn<T, string>;
export function useOrderBasket<T extends OrderBasketItem>(
  grouping?: string | null,
  postDataPrepFunction?: PostDataPrepFunction,
): UseOrderBasketReturn<T, string | void> {
  const { items, postDataPrepFunctions, setOrderBasketItems, setPostDataPrepFunctionForGrouping } = useStoreWithActions(
    orderBasketStore,
    orderBasketStoreActions,
  );
  const orders = getOrderItems(items, grouping);

  useEffect(() => {
    if (postDataPrepFunction && !postDataPrepFunctions[grouping]) {
      setPostDataPrepFunctionForGrouping(grouping, postDataPrepFunction);
    }
  }, [postDataPrepFunction, grouping, postDataPrepFunctions, setPostDataPrepFunctionForGrouping]);

  if (typeof grouping === 'string') {
    const setOrders = (value: Array<T> | (() => Array<T>)) => {
      return setOrderBasketItems(grouping, value);
    };
    return { orders, clearOrders, setOrders } as UseOrderBasketReturn<T, string>;
  } else {
    const setOrders = (groupingKey: string, value: Array<T> | (() => Array<T>)) => {
      setOrderBasketItems(groupingKey, value);
    };
    return { orders, clearOrders, setOrders } as UseOrderBasketReturn<T, void>;
  }
}
