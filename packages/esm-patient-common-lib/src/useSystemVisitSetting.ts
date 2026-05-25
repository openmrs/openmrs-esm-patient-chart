import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';

/**
 * Reads the OpenMRS system setting `visits.enabled` to determine whether
 * the visit-based workflow is active for this deployment.
 *
 * Uses SWR immutable so the setting is fetched once per session and never
 * re-validated on focus/interval. The visits configuration is a deployment-level
 * setting that does not change at runtime, so constant polling would waste bandwidth.
 *
 * @returns systemVisitEnabled — true if visits are enabled (default when setting is absent)
 */
export function useSystemVisitSetting() {
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<{ value: 'true' | 'false' }>, Error>(
    `${restBaseUrl}/systemsetting/visits.enabled?v=custom:(value)`,
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
