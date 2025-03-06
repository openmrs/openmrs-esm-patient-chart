import { useCallback } from 'react';
import { type DefaultWorkspaceProps, launchWorkspace, navigateAndLaunchWorkspace } from '@openmrs/esm-framework';
import { usePatientChartStore } from './store/patient-chart-store';
import { launchStartVisitPrompt } from './launchStartVisitPrompt';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import { useVisitOrOfflineVisit } from './offline/visit';

export interface DefaultPatientWorkspaceProps extends DefaultWorkspaceProps {
  patient: fhir.Patient;
  patientUuid: string;
}

/**
 * @deprecated Use `launchWorkspace()` instead
 */
export const launchPatientWorkspace = launchWorkspace;

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
  const { patientUuid, patient } = usePatientChartStore();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchPatientWorkspaceCb = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || currentVisit) {
        launchWorkspace(workspaceName, additionalProps);
      } else {
        launchStartVisitPrompt();
      }
    },
    [currentVisit, systemVisitEnabled, workspaceName],
  );
  return launchPatientWorkspaceCb;
}
