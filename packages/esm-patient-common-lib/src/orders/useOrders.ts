import useSWR, { mutate, useSWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback, useMemo } from 'react';
import { type OrderTypeFetchResponse, type PatientOrderFetchResponse } from '@openmrs/esm-patient-common-lib';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

export function usePatientOrders(patientUuid: string, status: 'ACTIVE' | 'any', orderType?: string) {
  const { mutate } = useSWRConfig();
  const baseOrdersUrl = `${restBaseUrl}/order?patient=${patientUuid}&v=full&careSetting=${careSettingUuid}&status=${status}`;
  const ordersUrl = orderType ? `${baseOrdersUrl}&orderType=${orderType}` : baseOrdersUrl;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () =>
      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/order?patient=${patientUuid}`);
      }, data),
    [patientUuid],
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

export function useOrderTypes() {
  const orderTypesUrl = `${restBaseUrl}/ordertype`;
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<OrderTypeFetchResponse>, Error>(
    orderTypesUrl,
    openmrsFetch,
  );

  return {
    data: data?.data?.results,
    error,
    isLoading,
    isValidating,
  };
}
