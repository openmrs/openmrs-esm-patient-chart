import useSWR from 'swr';
import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type OrderStockData } from '../types/order';

export const useOrderStockInfo = (orderItemUuid: string) => {
  const { data, isLoading } = useSWR<FetchResponse<OrderStockData>>(
    orderItemUuid ? `${fhirBaseUrl}/InventoryItem?code=${orderItemUuid}` : null,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      data: data?.data || null,
      isLoading,
    }),
    [data, isLoading],
  );
};
