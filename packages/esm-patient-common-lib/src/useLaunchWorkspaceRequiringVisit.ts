import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import useSWRImmutable from 'swr/immutable';

import { useCallback, useMemo } from 'react';
import { FetchResponse, openmrsFetch, usePatient } from '@openmrs/esm-framework';

export function useLaunchWorkspaceRequiringVisit(workspaceName: string) {
  const { patientUuid } = usePatient();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchOrderBasket = useCallback((additionalProps?: object) => {
    if (!systemVisitEnabled || currentVisit) {
      launchPatientWorkspace(workspaceName, additionalProps);
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit, systemVisitEnabled, workspaceName]);
  return launchOrderBasket;
}

function useSystemVisitSetting() {
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