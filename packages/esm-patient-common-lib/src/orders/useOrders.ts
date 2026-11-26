import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl, translateFrom } from '@openmrs/esm-framework';
import type { Order, PatientOrderFetchResponse, PriorityOption } from './types';

export type Status = 'ACTIVE' | 'any';
export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';
const patientChartAppModuleName = '@openmrs/esm-patient-chart-app';

export const drugCustomRepresentation =
  'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:(uuid,display,visit),orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

export const orderCustomRepresentation =
  'custom:(uuid,display,orderNumber,accessionNumber,patient,concept,action,careSetting,previousOrder,dateActivated,scheduledDate,dateStopped,autoExpireDate,encounter:(uuid,display,visit),orderer:ref,orderReason,orderReasonNonCoded,orderType,urgency,instructions,commentToFulfiller,fulfillerStatus)';

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
        ? [...data.data.results]?.sort(
            (a, b) => new Date(b.dateActivated).getTime() - new Date(a.dateActivated).getTime(),
          )
        : null,
    [data],
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
  return openmrsFetch<Order>(`${restBaseUrl}/order/${orderUuid}?v=${drugCustomRepresentation}`);
}

export function useDrugOrderByUuid(orderUuid: string) {
  const { data, error, isLoading } = useSWR<FetchResponse<Order>, Error>(
    orderUuid ? `${restBaseUrl}/order/${orderUuid}?v=${drugCustomRepresentation}` : null,
    openmrsFetch,
  );

  return {
    data: data?.data ?? null,
    error,
    isLoading,
  };
}

/**
 * The order priorities, with labels translated when called. Call it at render time: translations
 * are not loaded yet when a module is first evaluated, so labels computed then stay in English.
 *
 * See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
 */
export function getPriorityOptions(): PriorityOption[] {
  return [
    { value: 'ROUTINE', label: translateFrom(patientChartAppModuleName, 'Routine') },
    { value: 'STAT', label: translateFrom(patientChartAppModuleName, 'Stat') },
    { value: 'ON_SCHEDULED_DATE', label: translateFrom(patientChartAppModuleName, 'On scheduled date') },
  ];
}

/**
 * @deprecated The labels are translated once, when the module loads, which is usually before the
 * translations are available. Use {@link getPriorityOptions} at render time for labels; the values
 * here are still correct.
 */
export const priorityOptions: PriorityOption[] = getPriorityOptions();
