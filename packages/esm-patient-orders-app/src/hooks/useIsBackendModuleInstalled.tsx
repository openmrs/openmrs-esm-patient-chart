import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';

interface ModuleData {
  results: Array<{ uuid: string }>;
}

export const useIsBackendModuleInstalled = (modules: string | string[]) => {
  const { data, isLoading, error } = useSWR<FetchResponse<ModuleData>>(
    `${restBaseUrl}/module?v=custom:(uuid)`,
    openmrsFetch,
  );

  return useMemo(() => {
    const installedModules = data?.data?.results?.map((module) => module.uuid) ?? [];
    const modulesToCheck = Array.isArray(modules) ? modules : [modules];

    const isInstalled = modulesToCheck.every((module) => installedModules.includes(module));

    return {
      isInstalled,
      isLoading,
      error,
    };
  }, [data, isLoading, error, modules]);
};
