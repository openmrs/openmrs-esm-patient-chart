import { openmrsFetch } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';

export function cancelOrder(order: Order, requestBody: any, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/order/${order.uuid}/fulfillerdetails/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestBody,
    signal: abortController.signal,
  });
}
