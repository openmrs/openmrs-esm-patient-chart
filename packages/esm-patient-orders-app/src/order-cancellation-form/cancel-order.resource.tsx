import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';

export function cancelOrder(order: Order, requestBody: any) {
  const ac = new AbortController();

  return openmrsFetch(`${restBaseUrl}/order/${order.uuid}/fulfillerdetails/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestBody,
    signal: ac.signal,
  });
}
