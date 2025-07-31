import { useCallback } from 'react';
import {
  launchWorkspace,
  navigateAndLaunchWorkspace,
  showModal,
  useFeatureFlag,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from './launchStartVisitPrompt';
import { usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';
import { useVisitOrOfflineVisit } from './offline/visit';

export interface PatientWorkspaceGroupProps {
  patient: fhir.Patient;
  patientUuid: string;
}

export interface PatientWorkspace2DefinitionProps<WorkspaceProps, WindowProps> extends Workspace2DefinitionProps<WorkspaceProps, WindowProps, PatientWorkspaceGroupProps> {};

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
  const startVisitIfNeeded = useStartVisitIfNeeded();
  const launchPatientWorkspaceCb = useCallback((additionalProps?: T) => {
    startVisitIfNeeded().then((didStartVisit) => {
      if (didStartVisit) {
        launchWorkspace(workspaceName, additionalProps);
      }
    });
    },
    [startVisitIfNeeded, workspaceName],
  );
  return launchPatientWorkspaceCb;
}

export function useStartVisitIfNeeded() {
  const { patientUuid } = usePatientChartStore();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const isRdeEnabled = useFeatureFlag('rde');

  const startVisitIfNeeded = useCallback(
    async (): Promise<boolean> => {
      if (!systemVisitEnabled || currentVisit) {
        return true;
      } else {
        return new Promise<boolean>((resolve) => {
          if (isRdeEnabled) {
              const dispose = showModal('visit-context-switcher', {
                patientUuid,
                closeModal: () => { dispose(); resolve(false); },
                onAfterVisitSelected: () => {
                  resolve(true);
                },
                size: 'sm',
              });
            } else {
              const dispose = showModal('start-visit-dialog', {
                closeModal: () => dispose(),
                onVisitStarted: () => resolve(true),
              });
          }
        });
      }
    },
    [currentVisit, systemVisitEnabled, isRdeEnabled, patientUuid],
  );
  return startVisitIfNeeded;

}
