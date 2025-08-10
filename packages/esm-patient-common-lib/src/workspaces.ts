import { useCallback } from 'react';
import {
  type DefaultWorkspaceProps,
  launchWorkspace,
  navigateAndLaunchWorkspace,
  showModal,
  useFeatureFlag,
  type Visit,
} from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from './launchStartVisitPrompt';
import { usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import { useVisitOrOfflineVisit } from './offline/visit';

export interface DefaultPatientWorkspaceProps extends DefaultWorkspaceProps {
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  mutateVisitContext: () => void;
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

/**
 * This hook MUST only be used in components mounted in the patient chart.
 * @param workspaceName
 * @returns
 */
export function useLaunchWorkspaceRequiringVisit<T extends object>(workspaceName: string) {
  const { patientUuid, patient, visitContext, mutateVisitContext } = usePatientChartStore();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');

  const launchPatientWorkspaceCb = useCallback(
    (additionalProps?: T) => {
      if (!systemVisitEnabled || visitContext) {
        launchWorkspace(workspaceName, { patientUuid, patient, visitContext, mutateVisitContext, ...additionalProps });
      } else {
        if (isRdeEnabled) {
          const dispose = showModal('visit-context-switcher', {
            patientUuid,
            closeModal: () => dispose(),
            onAfterVisitSelected: () => launchWorkspace(workspaceName, additionalProps),
            size: 'sm',
          });
        } else {
          launchStartVisitPrompt();
        }
      }
    },
    [visitContext, mutateVisitContext, systemVisitEnabled, workspaceName, isRdeEnabled, patientUuid, patient],
  );
  return launchPatientWorkspaceCb;
}
