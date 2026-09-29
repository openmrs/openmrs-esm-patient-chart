import { useCallback, useEffect, useRef } from 'react';
import {
  type Encounter,
  type ExportedWorkspaceWindowInfo,
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

/**
 * Name of the extension slot rendered by the encounter workspace. Each app contributes an extension
 * to this slot that renders its own exported workspace when it recognizes the encounter.
 */
export const encounterWorkspaceSlotName = 'encounter-workspace-slot';

/**
 * State passed to extensions in the encounter workspace slot. An extension should render nothing
 * unless the encounter (or the explicitly requested `workspaceType`) is one it handles.
 */
export type EncounterWorkspaceSlotState = {
  /** When set, explicitly selects the kind of encounter workspace to show, overriding detection from `encounter` */
  workspaceType?: string;
  /** The encounter being edited; undefined when creating a new one */
  encounter?: Encounter;
  additionalProps?: Record<string, unknown>;
  onEncounterSaved?: (updatedEncounter?: Encounter) => void;
  /** Must be referentially stable, since `ExportedWorkspace` re-seeds when it changes */
  groupProps: PatientWorkspaceGroupProps;
  onWindowChanged: (windowInfo: ExportedWorkspaceWindowInfo) => void;
};

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
  const { visitContext, workspaceGroupVisitUuid } = usePatientChartStore(patientUuid);
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');
  // Setting a new visit context makes the patient chart relaunch its workspace group, which closes
  // any workspace opened before the relaunch. So a pending prompt resolves only once the workspace
  // group has the new visit context.
  const pendingPromptResolvers = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (visitContext && workspaceGroupVisitUuid === visitContext.uuid) {
      const resolvers = pendingPromptResolvers.current;
      pendingPromptResolvers.current = [];
      resolvers.forEach((resolvePrompt) => resolvePrompt());
    }
  }, [visitContext, workspaceGroupVisitUuid]);

  const startVisitIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!systemVisitEnabled || visitContext) {
      return true;
    } else {
      return new Promise<boolean>((resolve) => {
        const resolveOnceWorkspaceGroupHasVisit = () => {
          pendingPromptResolvers.current.push(() => resolve(true));
        };

        if (isRdeEnabled) {
          let isVisitSelected = false;
          const dispose = showModal('visit-context-switcher', {
            patientUuid,
            closeModal: () => {
              dispose();
              if (!isVisitSelected) {
                resolve(false);
              }
            },
            onAfterVisitSelected: () => {
              isVisitSelected = true;
              resolveOnceWorkspaceGroupHasVisit();
            },
            size: 'sm',
          });
        } else {
          const dispose = showModal('start-visit-dialog', {
            closeModal: () => dispose(),
            onCancel: () => {
              dispose();
              resolve(false);
            },
            onVisitStarted: resolveOnceWorkspaceGroupHasVisit,
          });
        }
      });
    }
  }, [visitContext, systemVisitEnabled, isRdeEnabled, patientUuid]);
  return startVisitIfNeeded;
}
