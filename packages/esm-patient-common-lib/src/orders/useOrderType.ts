import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import type { OrderTypeResponse } from './types';

export function useOrderType(orderTypeUuid: string) {
  const { data, isLoading, isValidating, error } = useSWRImmutable<FetchResponse<OrderTypeResponse>>(
    `${restBaseUrl}/ordertype/${orderTypeUuid}`,
    openmrsFetch,
  );
  const results = useMemo(
    () => ({
      isLoadingOrderType: isLoading,
      orderType: data?.data,
      errorFetchingOrderType: error,
      isValidatingOrderType: isValidating,
    }),
    [data?.data, error, isLoading, isValidating],
  );
  return results;
}
