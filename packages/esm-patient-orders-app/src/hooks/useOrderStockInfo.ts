import useSWR from 'swr';
import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type OrderStockData } from '../types/order';
import { useIsBackendModuleInstalled } from './useIsBackendModuleInstalled';

export const useOrderStockInfo = (orderItemUuid: string) => {
  const { isInstalled, isLoading: isCheckingModules } = useIsBackendModuleInstalled(['fhirproxy', 'stockmanagement']);

  const { data, isLoading, error } = useSWR<FetchResponse<OrderStockData>>(
    orderItemUuid && isInstalled && !isCheckingModules ? `${fhirBaseUrl}/InventoryItem?code=${orderItemUuid}` : null,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      data: data?.data || null,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  );
};
