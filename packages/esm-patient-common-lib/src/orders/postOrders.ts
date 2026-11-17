import {
  type Concept,
  type Encounter,
  openmrsFetch,
  type OpenmrsResource,
  parseDate,
  restBaseUrl,
  toOmrsIsoString,
  type Visit,
} from '@openmrs/esm-framework';
import { type OrderBasketStore, orderBasketStore } from './store';
import type { ExtractedOrderErrorObject, Order, OrderBasketItem, OrderErrorObject, OrderPost } from './types';

function getOrdersPayloadFromOrderBasket(patientUuid: string, ordererUuid: string): Array<OrderPost> {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  if (!patientItems) {
    return [];
  }

  const orders: Array<OrderPost> = [];
  Object.entries(patientItems).forEach(([grouping, groupOrders]) => {
    groupOrders.forEach((order) => {
      orders.push(postDataPrepFunctions[grouping](order, patientUuid, null, ordererUuid));
    });
  });

  return orders;
}

/**
 * Guards against a malformed date silently corrupting the POST payload: an invalid `Date` is
 * truthy and fails every comparison, so it would otherwise slip through unclamped and serialize to
 * `null`/`"Invalid Date"`. Throws with the offending value so the failure is diagnosable.
 */
function assertValidDate(date: Date, rawValue: string): Date {
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Cannot post orders: "${rawValue}" is not a valid date.`);
  }
  return date;
}

/**
 * The earliest explicit `dateActivated` among the prepped orders, or `undefined` when none set
 * one. Orders left without a `dateActivated` are stamped by the server at request time, so they
 * impose no lower bound on the encounter datetime.
 */
function earliestDateActivated(orders: ReadonlyArray<OrderPost>): Date | undefined {
  let earliest: Date | undefined;
  for (const order of orders) {
    if (!order.dateActivated) {
      continue;
    }
    const dateActivated = assertValidDate(new Date(order.dateActivated), order.dateActivated);
    if (!earliest || dateActivated < earliest) {
      earliest = dateActivated;
    }
  }
  return earliest;
}

export async function postOrdersOnNewEncounter(
  patientUuid: string,
  orderEncounterType: string,
  currentVisit: Visit | null,
  orderLocationUuid: string,
  ordererUuid: string,
  abortController?: AbortController,
) {
  const orders = getOrdersPayloadFromOrderBasket(patientUuid, ordererUuid);

  // The backend enforces `dateActivated >= encounterDatetime`, so the encounter must sit at or
  // before the earliest explicitly-requested order activation. Orders without a `dateActivated`
  // are "start now": in a real-time (open) visit we leave encounterDatetime unset too, so the
  // server stamps the encounter and those orders at the same request-time clock.
  let encounterDatetime = earliestDateActivated(orders);

  // A stopped (retrospective) visit ended in the past, so the server's "now" would fall outside
  // the visit window. Pin the encounter to the visit start when nothing else set it.
  const isRetrospective = Boolean(currentVisit?.stopDatetime);
  if (!encounterDatetime && isRetrospective) {
    encounterDatetime = assertValidDate(parseDate(currentVisit.startDatetime), currentVisit.startDatetime);
  }

  // Clamp to the visit window so Encounter.datetimeShouldBeInVisitDatesRange holds at both ends.
  if (encounterDatetime && currentVisit?.startDatetime) {
    const visitStart = assertValidDate(parseDate(currentVisit.startDatetime), currentVisit.startDatetime);
    if (encounterDatetime < visitStart) {
      encounterDatetime = visitStart;
    }
  }
  if (encounterDatetime && currentVisit?.stopDatetime) {
    const visitStop = assertValidDate(parseDate(currentVisit.stopDatetime), currentVisit.stopDatetime);
    if (encounterDatetime > visitStop) {
      encounterDatetime = visitStop;
    }
  }

  if (encounterDatetime) {
    const encounterDateActivated = toOmrsIsoString(encounterDatetime);
    for (const order of orders) {
      if (order.dateActivated) {
        // Keep explicit start dates, but raise any that clamping pushed below the encounter.
        if (new Date(order.dateActivated) < encounterDatetime) {
          order.dateActivated = encounterDateActivated;
        }
      } else if (isRetrospective && !order.scheduledDate) {
        // "Start now" orders in a closed visit must be pinned to the encounter datetime; otherwise
        // the server would stamp them at real-time now, outside the visit window.
        order.dateActivated = encounterDateActivated;
      }
    }
  }

  const encounterPostData: EncounterPost = {
    patient: patientUuid,
    location: orderLocationUuid,
    encounterType: orderEncounterType,
    // Only send encounterDatetime when we need a specific time; otherwise let the server default it
    // to now (EncounterResource.newDelegate() stamps the request-time server clock).
    ...(encounterDatetime ? { encounterDatetime } : {}),
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
