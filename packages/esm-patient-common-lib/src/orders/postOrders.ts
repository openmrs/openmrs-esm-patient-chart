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
      encounterDate = new Date();
    }
  }

  const orders = getOrdersPayloadFromOrderBasket(patientUuid, ordererUuid);

  const encounterPostData: EncounterPost = {
    patient: patientUuid,
    location: orderLocationUuid,
    encounterType: orderEncounterType,
    encounterDatetime: encounterDate,
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
  encounterDatetime: Date;
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
  for (let grouping in patientItems) {
    const orders = patientItems[grouping];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const dataPrepFn = postDataPrepFunctions[grouping];

      if (typeof dataPrepFn !== 'function') {
        console.warn(`The postDataPrep function registered for ${grouping} orders is not a function`);
        continue;
      }

      await postOrder(dataPrepFn(order, patientUuid, encounterUuid, ordererUuid), abortController)
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
    }
  }
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
