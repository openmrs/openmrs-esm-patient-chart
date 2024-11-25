import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { OrderUrgency, OrderTypeFetchResponse, PatientOrderFetchResponse } from './types';

export type Status = 'ACTIVE' | 'any';
export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

export const drugCustomRepresentation =
  'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:ref,orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

export function usePatientOrders(
  patientUuid: string,
  status?: Status,
  orderType?: string,
  startDate?: string,
  endDate?: string,
) {
  const { mutate } = useSWRConfig();
  const baseOrdersUrl =
    startDate && endDate
      ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=full&activatedOnOrAfterDate=${startDate}&activatedOnOrBeforeDate=${endDate}`
      : `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=full&status=${status}`;
  const ordersUrl = orderType ? `${baseOrdersUrl}&orderType=${orderType}` : baseOrdersUrl;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () =>
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${patientUuid}`), data),
    [data, mutate, patientUuid],
  );

  const orders = useMemo(
    () =>
      data?.data?.results
        ? data.data.results?.sort((order1, order2) => (order2.dateActivated > order1.dateActivated ? 1 : -1))
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
  return openmrsFetch(`${restBaseUrl}/order/${orderUuid}?v=${drugCustomRepresentation}`);
}

type PriorityOption = {
  label: string;
  value: OrderUrgency;
};

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions: PriorityOption[] = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
];
