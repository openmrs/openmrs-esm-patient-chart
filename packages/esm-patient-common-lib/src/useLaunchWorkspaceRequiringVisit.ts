import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useCallback } from 'react';
import { useSystemVisitSetting } from '../../esm-patient-medications-app/src/api/api';
import { usePatient } from '@openmrs/esm-framework';

export function useLaunchWorkspaceRequiringVisit(workspaceName: string) {
  const { patientUuid } = usePatient();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchOrderBasket = useCallback(() => {
    if (!systemVisitEnabled || currentVisit) {
      launchPatientWorkspace(workspaceName);
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit, systemVisitEnabled, workspaceName]);
  return launchOrderBasket;
}
