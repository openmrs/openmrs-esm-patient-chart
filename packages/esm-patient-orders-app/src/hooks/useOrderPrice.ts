import { type OrderPriceData } from '../types/order';
import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';
import { useIsBackendModuleInstalled } from './useIsBackendModuleInstalled';

export const useOrderPrice = (orderItemUuid: string) => {
  const { isInstalled, isLoading: isCheckingModules } = useIsBackendModuleInstalled(['fhirproxy', 'billing']);

  const { data, isLoading, error } = useSWR<FetchResponse<OrderPriceData>>(
    orderItemUuid && isInstalled && !isCheckingModules
      ? `${fhirBaseUrl}/ChargeItemDefinition?code=${orderItemUuid}`
      : null,
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
