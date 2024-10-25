import { type OrderPriceData } from '../types/order';
import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';

export const useOrderPrice = (orderItemUuid: string) => {
  const { data, isLoading } = useSWR<FetchResponse<OrderPriceData>>(
    orderItemUuid ? `${fhirBaseUrl}/ChargeItemDefinition?code=${orderItemUuid}` : null,
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
