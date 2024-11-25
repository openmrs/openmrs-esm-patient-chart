import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { OrderTypeFetchResponse } from './types';
import { useMemo } from 'react';

export function useOrderTypes() {
  const orderTypesUrl = `${restBaseUrl}/ordertype`;
  const { data, error, isLoading, isValidating } = useSWRImmutable<FetchResponse<OrderTypeFetchResponse>, Error>(
    orderTypesUrl,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      data: data?.data?.results,
      error,
      isLoading,
      isValidating,
    }),
    [data?.data?.results, error, isLoading, isValidating],
  );

  return results;
}
