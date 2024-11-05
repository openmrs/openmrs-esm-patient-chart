import {
  type DefaultWorkspaceProps,
  launchWorkspace,
  navigateAndLaunchWorkspace,
  usePatient,
} from '@openmrs/esm-framework';
import { getPatientUuidFromStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import { useVisitOrOfflineVisit } from './offline/visit';
import { useCallback } from 'react';
import { launchStartVisitPrompt } from './launchStartVisitPrompt';
import { usePatientChartStore } from './store/patient-chart-store';

export interface DefaultPatientWorkspaceProps extends DefaultWorkspaceProps {
  patientUuid: string;
}

export function launchPatientWorkspace(workspaceName: string, additionalProps?: object) {
  const patientUuid = getPatientUuidFromStore();
  launchWorkspace(workspaceName, {
    patientUuid: patientUuid,
    ...additionalProps,
  });
}

export function launchPatientChartWithWorkspaceOpen({
  patientUuid,
  workspaceName,
  dashboardName,
  additionalProps,
}: {
  patientUuid: string;
  workspaceName: string;
  dashboardName?: string;
  additionalProps?: object;
}) {
  navigateAndLaunchWorkspace({
    targetUrl: '${openmrsSpaBase}/patient/' + `${patientUuid}/chart` + (dashboardName ? `/${dashboardName}` : ''),
    workspaceName: workspaceName,
    contextKey: `patient/${patientUuid}`,
    additionalProps,
  });
}

export function useLaunchWorkspaceRequiringVisit<T extends object>(workspaceName: string) {
  const { patientUuid } = usePatientChartStore();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchPatientWorkspaceCb = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || currentVisit) {
        launchPatientWorkspace(workspaceName, additionalProps);
      } else {
        launchStartVisitPrompt();
      }
    },
    [currentVisit, systemVisitEnabled, workspaceName],
  );
  return launchPatientWorkspaceCb;
}
