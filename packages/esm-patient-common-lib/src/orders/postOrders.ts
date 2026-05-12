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

function getOrdersPayloadFromOrderBasket(patientUuid: string, ordererUuid: string, encounterDate?: Date) {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  const orders: Array<OrderPost> = [];
  Object.entries(patientItems).forEach(([grouping, groupOrders]) => {
    groupOrders.forEach((order) => {
      const preppedOrder = encounterDate ? floorOrderStartDate(order, encounterDate) : order;
      orders.push(postDataPrepFunctions[grouping](preppedOrder, patientUuid, null, ordererUuid));
    });
  });

  return orders;
}

/**
 * Returns a shallow copy of the basket item with `startDate` floored to `encounterDate`.
 * The backend enforces `dateActivated >= encounterDatetime`, so if a user-selected
 * startDate fell before the encounter date (e.g. because it was earlier than the visit
 * start), it must be raised to match.
 */
function floorOrderStartDate<T extends OrderBasketItem>(order: T, encounterDate: Date): T {
  const startDateValue = (order as { startDate?: Date | string }).startDate;
  if (!startDateValue) {
    return order;
  }
  const startDate = startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
  if (startDate < encounterDate) {
    return { ...order, startDate: encounterDate } as T;
  }
  return order;
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

  // Floor the encounter datetime to the visit's start so the backend's
  // Encounter.datetimeShouldBeInVisitDatesRange constraint holds.
  if (encounterDate && currentVisit?.startDatetime) {
    const visitStart = parseDate(currentVisit.startDatetime);
    if (encounterDate < visitStart) {
      encounterDate = visitStart;
    }
  }

  const orders = getOrdersPayloadFromOrderBasket(patientUuid, ordererUuid, encounterDate ?? undefined);

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
