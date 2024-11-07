import useSWR from 'swr';
import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type OrderStockData } from '../types/order';
import { useAreBackendModuleInstalled } from './useAreBackendModuleInstalled';

export const useOrderStockInfo = (orderItemUuid: string) => {
  const { areModulesInstalled, isCheckingModules } = useAreBackendModuleInstalled(['fhirproxy', 'stockmanagement']);

  const { data, isLoading, error } = useSWR<FetchResponse<OrderStockData>>(
    orderItemUuid && areModulesInstalled && !isCheckingModules
      ? `${fhirBaseUrl}/InventoryItem?code=${orderItemUuid}`
      : null,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      data: data?.data ?? null,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  );
};
