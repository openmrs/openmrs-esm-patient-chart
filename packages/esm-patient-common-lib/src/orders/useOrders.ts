import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl, translateFrom } from '@openmrs/esm-framework';
import type { Order, PatientOrderFetchResponse, PriorityOption } from './types';

export type Status = 'ACTIVE' | 'any';
export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';
const patientChartAppModuleName = '@openmrs/esm-patient-chart-app';

export const drugCustomRepresentation =
  'custom:(uuid,drugNonCoded,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:(uuid,display,visit),orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten,concept)';

export const orderCustomRepresentation =
  'custom:(uuid,display,orderNumber,accessionNumber,patient,concept,action,careSetting,previousOrder,dateActivated,scheduledDate,dateStopped,autoExpireDate,encounter:(uuid,display,visit),orderer:ref,orderReason,orderReasonNonCoded,orderType,urgency,instructions,commentToFulfiller,fulfillerStatus)';

/**
 * Ensures a drug order has a display name, even if it is non-coded.
 *
 * @param order The order to normalize.
 * @returns The order with patched drug display objects.
 */
export function normalizeDrugOrder(order: Order): Order {
  // If there is no coded drug but there is a non-coded drug name
  if (!order.drug && order.drugNonCoded) {
    return {
      ...order,
      drug: {
        drugNonCoded: order.drugNonCoded,
        display: order.drugNonCoded,
        concept: {
          uuid: order.concept.uuid,
        },
      },
    };
  }
  return order;
}

/**
 * Ensures drug orders have a display name, even if they are non-coded.
 *
 * @param orders The orders to normalize.
 * @returns The orders with patched drug display objects.
 */
export function normalizeDrugOrders(orders: Order[]): Order[] {
  return orders?.map(normalizeDrugOrder);
}

/**
 * Ensures orders have a display name, even if they are non-coded.
 *
 * @param orders The orders to normalize.
 * @param ordersType The type of the orders.
 * @returns The orders with patched order display objects.
 */
function normalizeOrders(orders: Order[], ordersType?: string): Order[] {
  switch (ordersType) {
    case 'drugorder':
      return normalizeDrugOrders(orders);

    case 'testorder':
      // TODO: implement normalizeTestOrders
      // return normalizeTestOrders(orders);
      return orders;

    default:
      return orders;
  }
}

export function usePatientOrders(
  patientUuid: string,
  status?: Status,
  orderType?: string,
  startDate?: string,
  endDate?: string,
) {
  const { mutate } = useSWRConfig();
  const activeStatusParams = status === 'ACTIVE' ? '&excludeCanceledAndExpired=true' : '';
  const baseOrdersUrl =
    startDate && endDate
      ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=${orderCustomRepresentation}&activatedOnOrAfterDate=${startDate}&activatedOnOrBeforeDate=${endDate}&excludeDiscontinueOrders=true${activeStatusParams}`
      : `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=${orderCustomRepresentation}&status=${status}&excludeDiscontinueOrders=true`;
  const ordersUrl = orderType ? `${baseOrdersUrl}&orderTypes=${orderType}` : baseOrdersUrl;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () =>
      mutate(
        (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${patientUuid}`),
        undefined,
        { revalidate: true },
      ),
    [mutate, patientUuid],
  );

  const orders = useMemo(
    () =>
      data?.data?.results
        ? normalizeOrders(
            [...data.data.results]?.sort(
              (a, b) => new Date(b.dateActivated).getTime() - new Date(a.dateActivated).getTime(),
            ),
            orderType,
          )
        : null,
    [data, orderType],
  );

  return {
    data: orders,
    error,
    isLoading,
    isValidating,
    mutate: mutateOrders,
  };
}

export function getDrugOrderByUuid(orderUuid: string) {
  return openmrsFetch<Order>(`${restBaseUrl}/order/${orderUuid}?v=${drugCustomRepresentation}`).then((response) =>
    normalizeDrugOrder(response.data),
  );
}

export function useDrugOrderByUuid(orderUuid: string) {
  const { data, error, isLoading } = useSWR<FetchResponse<Order>, Error>(
    orderUuid ? `${restBaseUrl}/order/${orderUuid}?v=${drugCustomRepresentation}` : null,
    openmrsFetch,
  );

  const drugOrder = useMemo(() => (data?.data ? normalizeDrugOrder(data?.data) : null), [data]);

  return {
    data: drugOrder,
    error,
    isLoading,
  };
}

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions: PriorityOption[] = [
  { value: 'ROUTINE', label: translateFrom(patientChartAppModuleName, 'Routine') },
  { value: 'STAT', label: translateFrom(patientChartAppModuleName, 'Stat') },
  { value: 'ON_SCHEDULED_DATE', label: translateFrom(patientChartAppModuleName, 'On scheduled date') },
];
