import { openmrsFetch, type OpenmrsResource, parseDate, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { type OrderBasketStore, orderBasketStore } from './store';
import type {
  DrugOrderPost,
  TestOrderPost,
  ExtractedOrderErrorObject,
  OrderBasketItem,
  OrderErrorObject,
  OrderPost,
} from './types';

export async function postOrdersOnNewEncounter(
  patientUuid: string,
  orderEncounterType: string,
  currentVisit: Visit | null,
  sessionLocationUuid: string,
  abortController?: AbortController,
) {
  const now = new Date();
  const visitStartDate = parseDate(currentVisit?.startDatetime);
  const visitEndDate = parseDate(currentVisit?.stopDatetime);
  let encounterDate: Date;
  if (!currentVisit || (visitStartDate < now && (!visitEndDate || visitEndDate > now))) {
    encounterDate = now;
  } else {
    console.warn(
      'postOrdersOnNewEncounter received an active visit that is not currently active. This is a programming error. Attempting to place the order using the visit start date.',
    );
    encounterDate = visitStartDate;
  }

  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  const orders: Array<DrugOrderPost | TestOrderPost> = [];

  Object.entries(patientItems).forEach(([grouping, groupOrders]) => {
    groupOrders.forEach((order) => {
      orders.push(postDataPrepFunctions[grouping](order, patientUuid, null));
    });
  });

  const encounterPostData = {
    patient: patientUuid,
    location: sessionLocationUuid,
    encounterType: orderEncounterType,
    encounterDatetime: encounterDate,
    visit: currentVisit?.uuid,
    obs: [],
    orders,
  };

  return openmrsFetch<OpenmrsResource>(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: encounterPostData,
    signal: abortController?.signal,
  }).then((res) => res?.data?.uuid);
}

export async function postOrders(patientUuid: string, encounterUuid: string, abortController: AbortController) {
  const { items, postDataPrepFunctions }: OrderBasketStore = orderBasketStore.getState();
  const patientItems = items[patientUuid];

  const erroredItems: Array<OrderBasketItem> = [];
  for (let grouping in patientItems) {
    const orders = patientItems[grouping];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const dataPrepFn = postDataPrepFunctions[grouping];

      if (typeof dataPrepFn !== 'function') {
        console.warn(`The postDataPrep function registered for ${grouping} orders is not a function`);
        continue;
      }

      await postOrder(dataPrepFn(order, patientUuid, encounterUuid), abortController).catch((error) => {
        erroredItems.push({
          ...order,
          orderError: error,
          extractedOrderError: extractErrorDetails(error),
        });
      });
    }
  }
  return erroredItems;
}

function postOrder(body: OrderPost, abortController?: AbortController) {
  return openmrsFetch(`${restBaseUrl}/order`, {
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
