import { openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

interface VisitSystemSettingResponse {
  results: Array<{
    value: 'true' | 'false';
  }>;
}

export const useVisitEnabledSystemSetting = () => {
  const { data, error, isLoading } = useSWR<{ data: VisitSystemSettingResponse }>(
    '/ws/rest/v1/systemsetting?q=visits.enabled&v=custom:(value)',
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      systemVisitEnabled: data?.data?.results[0].value === 'true',
      errorFetchingSystemVisitSetting: error,
      isLoadingSystemVisitSetting: isLoading,
    }),
    [data, isLoading, error],
  );

  return results;
};
