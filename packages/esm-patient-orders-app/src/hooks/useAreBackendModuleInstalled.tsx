import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';

interface ModuleData {
  results: Array<{ uuid: string }>;
}

export const useAreBackendModuleInstalled = (modules: string | string[]) => {
  const { data, isLoading, error } = useSWR<FetchResponse<ModuleData>, Error>(
    `${restBaseUrl}/module?v=custom:(uuid)`,
    openmrsFetch,
  );

  return useMemo(() => {
    const installedModules = data?.data?.results?.map((module) => module.uuid) ?? [];
    const modulesToCheck = Array.isArray(modules) ? modules : [modules];

    const areModulesInstalled = modulesToCheck.every((module) => installedModules.includes(module));

    return {
      areModulesInstalled,
      isCheckingModules: isLoading,
      moduleCheckError: error,
    };
  }, [data, isLoading, error, modules]);
};
