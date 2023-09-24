import { createGlobalStore } from '@openmrs/esm-framework';
import type { OrderBasketItem, PostDataPrepFunction } from './types';

// The order basket holds order information for each patient. The orders are grouped by `key`
// so that different parts of the application may manage their own order lists. For example,
// the medication order list might be grouped as `medications`, and might be managed by the
// medication order basket panel.
export interface OrderBasketStore {
  items: {
    [patientUuid: string]: {
      [grouping: string]: Array<OrderBasketItem>;
    };
  };
  postDataPrepFunctions: {
    [grouping: string]: PostDataPrepFunction;
  };
}

const initialState = {
  items: {},
  postDataPrepFunctions: {},
};

export const orderBasketStore = createGlobalStore<OrderBasketStore>('order-basket', initialState);

/**
 * @internal for testing only
 */
export function _resetOrderBasketStore() {
  orderBasketStore.setState(initialState);
}
