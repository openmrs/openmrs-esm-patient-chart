import { useCallback } from 'react';
import { usePatient } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useSystemVisitSetting } from './useSystemVisitSetting';

export function useLaunchWorkspaceRequiringVisit<T extends object>(workspaceName: string) {
  const { patientUuid } = usePatient();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchOrderBasket = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || currentVisit) {
        console.log("launching workspace", workspaceName, "with props", additionalProps);
        launchPatientWorkspace(workspaceName, additionalProps);
      } else {
        launchStartVisitPrompt();
      }
    },
    [currentVisit, systemVisitEnabled, workspaceName],
  );
  return launchOrderBasket;
}
