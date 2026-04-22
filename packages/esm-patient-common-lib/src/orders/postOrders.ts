import {
  type Concept,
  type Encounter,
  openmrsFetch,
  type OpenmrsResource,
  parseDate,
  restBaseUrl,
  type Visit,
} from '@openmrs/esm-framework';
import { type OrderBasketStore, orderBasketStore } from './store';
import type { ExtractedOrderErrorObject, Order, OrderBasketItem, OrderErrorObject, OrderPost } from './types';

function getOrdersPayloadFromOrderBasket(patientUuid: string, ordererUuid: string) {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  const orders: Array<OrderPost> = [];
  Object.entries(patientItems).forEach(([grouping, groupOrders]) => {
    groupOrders.forEach((order) => {
      orders.push(postDataPrepFunctions[grouping](order, patientUuid, null, ordererUuid));
    });
  });

  return orders;
}

/**
 * Groups all pending basket orders by their resolved encounter type UUID.
 * Orders whose grouping key is not present in `encounterTypeMap` fall back to `defaultEncounterType`.
 */
function getOrdersGroupedByEncounterType(
  patientUuid: string,
  ordererUuid: string,
  defaultEncounterType: string,
  encounterTypeMap: Array<{ orderBasketGrouping: string; encounterTypeUuid: string }>,
): Map<string, Array<OrderPost>> {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid] ?? {};
  const groupingToEncounterType = new Map(
    encounterTypeMap.map(({ orderBasketGrouping, encounterTypeUuid }) => [orderBasketGrouping, encounterTypeUuid]),
  );

  const result = new Map<string, Array<OrderPost>>();

  Object.entries(patientItems).forEach(([grouping, groupOrders]) => {
    const encounterType = groupingToEncounterType.get(grouping) ?? defaultEncounterType;

    if (!result.has(encounterType)) {
      result.set(encounterType, []);
    }

    const dataPrepFn = postDataPrepFunctions[grouping];
    if (typeof dataPrepFn !== 'function') {
      console.warn(`The postDataPrep function registered for ${grouping} orders is not a function`);
      return;
    }

    groupOrders.forEach((order) => {
      result.get(encounterType).push(dataPrepFn(order, patientUuid, null, ordererUuid));
    });
  });

  return result;
}

export async function postOrdersOnNewEncounter(
  patientUuid: string,
  orderEncounterType: string,
  currentVisit: Visit | null,
  orderLocationUuid: string,
  ordererUuid: string,
  abortController?: AbortController,

  /**
   * If not specified, the encounterDate will either be set to
   * `now` if currentVisit is active, or the start of the visit
   */
  encounterDate?: Date,
) {
  if (!encounterDate) {
    if (currentVisit?.stopDatetime) {
      encounterDate = parseDate(currentVisit.startDatetime);
    } else {
      encounterDate = null;
    }
  }

  const orders = getOrdersPayloadFromOrderBasket(patientUuid, ordererUuid);

  const encounterPostData: EncounterPost = {
    patient: patientUuid,
    location: orderLocationUuid,
    encounterType: orderEncounterType,
    // only specify the encounterDatetime if it's given, otherwise
    // don't specify that let the server default it to `now`
    ...(encounterDate ? { encounterDatetime: encounterDate } : {}),
    visit: currentVisit?.uuid,
    obs: [],
    orders,
  };

  return postEncounter(encounterPostData, abortController);
}
export interface PostOrdersOnNewEncountersByTypeOptions {
  patientUuid: string;
  defaultOrderEncounterType: string;
  currentVisit: Visit | null;
  orderLocationUuid: string;
  ordererUuid: string;
  /** Maps order basket grouping keys to encounter type UUIDs. Defaults to `[]` (single encounter). */
  orderTypeEncounterTypeMap?: Array<{ orderBasketGrouping: string; encounterTypeUuid: string }>;
  abortController?: AbortController;
  /**
   * If not specified, the encounterDate will either be set to `now` if currentVisit is active,
   * or the start of the visit.
   */
  encounterDate?: Date;
}

/**
 * Like {@link postOrdersOnNewEncounter} but supports a per-order-type encounter type mapping.
 *
 * When `orderTypeEncounterTypeMap` is non-empty, basket orders are grouped by their store
 * grouping key and each unique encounter type gets its own encounter POST.  Orders whose
 * grouping is not listed in the map fall back to `defaultOrderEncounterType`.
 *
 * When `orderTypeEncounterTypeMap` is empty (the default), all orders are placed in a single
 * encounter using `defaultOrderEncounterType`, preserving the original behaviour.
 *
 * @returns All created encounters (one per unique encounter type that received at least one order).
 */
export async function postOrdersOnNewEncountersByType({
  patientUuid,
  defaultOrderEncounterType,
  currentVisit,
  orderLocationUuid,
  ordererUuid,
  orderTypeEncounterTypeMap = [],
  abortController,
  encounterDate,
}: PostOrdersOnNewEncountersByTypeOptions): Promise<Array<Encounter>> {
  if (!encounterDate) {
    if (currentVisit?.stopDatetime) {
      encounterDate = parseDate(currentVisit.startDatetime);
    } else {
      encounterDate = null;
    }
  }

  const ordersByEncounterType = getOrdersGroupedByEncounterType(
    patientUuid,
    ordererUuid,
    defaultOrderEncounterType,
    orderTypeEncounterTypeMap,
  );

  const encounterPromises = Array.from(ordersByEncounterType.entries())
    .filter(([, orders]) => orders.length > 0)
    .map(([encounterTypeUuid, orders]) => {
      const encounterPostData: EncounterPost = {
        patient: patientUuid,
        location: orderLocationUuid,
        encounterType: encounterTypeUuid,
        ...(encounterDate ? { encounterDatetime: encounterDate } : {}),
        visit: currentVisit?.uuid,
        obs: [],
        orders,
      };
      return postEncounter(encounterPostData, abortController);
    });

  return Promise.all(encounterPromises);
}

interface ObsPayload {
  concept: Concept | string;
  value?: string | OpenmrsResource;
  groupMembers?: Array<ObsPayload>;
}
export interface EncounterPost {
  patient: string;
  location: string;
  encounterType: string;
  encounterDatetime?: Date;
  visit?: string;
  obs: ObsPayload[];
  orders: OrderPost[];
}

export async function postEncounter(encounterPostData: EncounterPost, abortController?: AbortController) {
  return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: encounterPostData,
    signal: abortController?.signal,
  }).then((res) => res?.data);
}

export async function postOrders(
  patientUuid: string,
  encounterUuid: string,
  abortController: AbortController,
  ordererUuid: string,
) {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  const erroredItems: Array<OrderBasketItem> = [];
  const postedOrders: Array<Order> = [];
  const promises: Array<Promise<void>> = [];

  for (const grouping in patientItems) {
    const orders = patientItems[grouping];
    const dataPrepFn = postDataPrepFunctions[grouping];

    if (typeof dataPrepFn !== 'function') {
      console.warn(`The postDataPrep function registered for ${grouping} orders is not a function`);
      continue;
    }

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      const promise = postOrder(dataPrepFn(order, patientUuid, encounterUuid, ordererUuid), abortController)
        .then((response) => {
          postedOrders.push(response.data);
        })
        .catch((error) => {
          erroredItems.push({
            ...order,
            orderError: error,
            extractedOrderError: extractErrorDetails(error),
          });
        });

      promises.push(promise);
    }
  }
  await Promise.allSettled(promises);

  return { postedOrders, erroredItems };
}

export function postOrder(body: OrderPost, abortController?: AbortController) {
  return openmrsFetch<Order>(`${restBaseUrl}/order`, {
    method: 'POST',
    signal: abortController?.signal,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

function extractErrorDetails(errorObject: OrderErrorObject): ExtractedOrderErrorObject {
  const errorDetails = {
    message: errorObject.responseBody?.error?.message,
    fieldErrors: [],
    globalErrors: errorObject.responseBody?.error?.globalErrors,
  };

  if (errorObject.responseBody?.error?.fieldErrors) {
    const fieldErrors = errorObject.responseBody?.error?.fieldErrors;
    for (const fieldName in fieldErrors) {
      fieldErrors[fieldName].forEach((error) => {
        errorDetails.fieldErrors.push(error.message);
      });
    }
  }

  return errorDetails;
}
