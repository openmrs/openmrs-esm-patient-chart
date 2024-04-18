import { useCallback } from 'react';
import { usePatient } from '@openmrs/esm-framework';
import { launchWorkspace, launchStartVisitPrompt, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { useSystemVisitSetting } from './useSystemVisitSetting';

export function useLaunchWorkspaceRequiringVisit<T extends object>(workspaceName: string) {
  const { patientUuid } = usePatient();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchWorkspace = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || currentVisit) {
        launchWorkspace(workspaceName, additionalProps);
      } else {
        launchStartVisitPrompt();
      }
    },
    [currentVisit, systemVisitEnabled, workspaceName],
  );
  return launchWorkspace;
}
