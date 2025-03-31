import {
  type DefaultWorkspaceProps,
  launchWorkspace,
  navigateAndLaunchWorkspace,
  showModal,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { useCallback } from 'react';
import { launchStartVisitPrompt } from './launchStartVisitPrompt';
import { useVisitOrOfflineVisit } from './offline/visit';
import { usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';

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
  const { patientUuid } = usePatientChartStore();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const isRdeEnabled = useFeatureFlag('rde');

  const launchPatientWorkspaceCb = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || currentVisit) {
        launchWorkspace(workspaceName, additionalProps);
      } else {
        if (isRdeEnabled) {
          const dispose = showModal('visit-context-switcher', {
            patientUuid,
            closeModal: () => dispose(),
            onAfterVisitSelected: () => launchPatientWorkspace(workspaceName, additionalProps),
            size: 'sm',
          });
        } else {
          launchStartVisitPrompt();
        }
      }
    },
    [currentVisit, systemVisitEnabled, workspaceName, isRdeEnabled, patientUuid],
  );
  return launchPatientWorkspaceCb;
}
