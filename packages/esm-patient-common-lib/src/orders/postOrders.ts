import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl } from '../get-patient-uuid-from-url';
import { type OrderBasketStore, orderBasketStore } from './store';
import { type OrderBasketItem, type OrderPost } from './types';

export async function postOrders(encounterUuid: string, abortController: AbortController) {
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

function extractErrorDetails(errorObject) {
  const errorDetails = {
    message: errorObject.responseBody.error.message,
    fieldErrors: [],
    globalErrors: errorObject.responseBody.error.globalErrors,
  };

  if (errorObject.responseBody.error.fieldErrors) {
    const fieldErrors = errorObject.responseBody.error.fieldErrors;
    for (const fieldName in fieldErrors) {
      fieldErrors[fieldName].forEach((error) => {
        errorDetails.fieldErrors.push(error.message);
      });
    }
  }

  return errorDetails;
}
