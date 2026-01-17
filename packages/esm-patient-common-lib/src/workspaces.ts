import { useCallback } from 'react';
import {
  launchWorkspace2,
  navigate,
  showModal,
  useFeatureFlag,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';

export interface PatientWorkspaceGroupProps {
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  mutateVisitContext: () => void;
}

export interface PatientChartWorkspaceActionButtonProps {
  groupProps: PatientWorkspaceGroupProps;
}

export type PatientWorkspace2DefinitionProps<
  WorkspaceProps extends object,
  WindowProps extends object,
> = Workspace2DefinitionProps<WorkspaceProps, WindowProps, PatientWorkspaceGroupProps>;

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
  launchWorkspace2(workspaceName, additionalProps);
  navigate({ to: '${openmrsSpaBase}/patient/' + `${patientUuid}/chart` + (dashboardName ? `/${dashboardName}` : '') });
}

export function useLaunchWorkspaceRequiringVisit<T extends object>(patientUuid: string, workspaceName: string) {
  const startVisitIfNeeded = useStartVisitIfNeeded(patientUuid);
  const launchPatientWorkspaceCb = useCallback(
    (workspaceProps?: T, windowProps?: any, groupProps?: any) => {
      startVisitIfNeeded().then((didStartVisit) => {
        if (didStartVisit) {
          launchWorkspace2(workspaceName, workspaceProps, windowProps, groupProps);
        }
      });
    },
    [startVisitIfNeeded, workspaceName],
  );
  return launchPatientWorkspaceCb;
}

export function useStartVisitIfNeeded(patientUuid: string) {
  const { visitContext } = usePatientChartStore(patientUuid);
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');

  const startVisitIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!systemVisitEnabled || visitContext) {
      return true;
    } else {
      return new Promise<boolean>((resolve) => {
        if (isRdeEnabled) {
          const dispose = showModal('visit-context-switcher', {
            patientUuid,
            closeModal: () => {
              dispose();
              resolve(false);
            },
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
  }, [visitContext, systemVisitEnabled, isRdeEnabled, patientUuid]);
  return startVisitIfNeeded;
}
