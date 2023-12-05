import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';

export function useSystemVisitSetting() {
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<{ value: 'true' | 'false' }>, Error>(
    `/ws/rest/v1/systemsetting/visits.enabled?v=custom:(value)`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      systemVisitEnabled: (data?.data?.value ?? 'true').toLowerCase() === 'true',
      errorFetchingSystemVisitSetting: error,
      isLoadingSystemVisitSetting: isLoading,
    }),
    [data, isLoading, error],
  );

  return results;
}
