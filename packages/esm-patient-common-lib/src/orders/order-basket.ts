import { createGlobalStore, openmrsFetch, useStoreWithActions } from '@openmrs/esm-framework';
import type { OrderBasketItem } from './types';
import { getPatientUuidFromUrl } from '../get-patient-uuid-from-url';
import { OrderPost } from './types';
import { useEffect } from 'react';

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
  postDataPrepFunctions: {
    [grouping: string]: PostDataPrepFunction;
  }
}

export type PostDataPrepFunction = (order: OrderBasketItem, patientUuid: string, encounterUuid: string) => OrderPost;

const orderBasketStore = createGlobalStore<OrderBasketStore>('order-basket', {
  items: {},
  postDataPrepFunctions: {},
});

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

export async function postOrders(
  encounterUuid: string,
  abortController: AbortController,
) {
  const patientUuid = getPatientUuidFromUrl();
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];
  
  const erroredItems: Array<OrderBasketItem> = [];
  for (let grouping in patientItems) {
    const orders = patientItems[grouping];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const dto = postDataPrepFunctions[grouping](order, patientUuid, encounterUuid);
      await postOrder(dto, abortController).catch((error) => {
        erroredItems.push({
          ...order,
          orderError: error,
        });
      });
    }
  }
  return erroredItems;
}

function postOrder(body: OrderPost, abortController?: AbortController) {
  return openmrsFetch(`/ws/rest/v1/order`, {
    method: 'POST',
    signal: abortController?.signal,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}