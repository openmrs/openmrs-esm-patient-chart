import { useCallback, useEffect, useRef } from 'react';
import {
  launchWorkspace2,
  navigate,
  showModal,
  useLayoutType,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { getPatientChartStoreState, usePatientChartStore } from './store/patient-chart-store';
import { useSystemVisitSetting } from './useSystemVisitSetting';

export interface PatientWorkspaceGroupProps {
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  /**
   * When the workspaces of this group render the patient banner themselves. The patient chart has its own
   * patient header on desktop, so every group props object it builds sets `'tabletOnly'` (required here so
   * that a launch cannot forget it). Other apps' workspace groups don't set it, which means `'always'`.
   * See `useShowPatientBanner`.
   */
  showPatientBanner: PatientBannerMode;
}

export type PatientBannerMode = 'always' | 'tabletOnly';

/**
 * The only part of the group props that workspaces shared between the patient chart and other apps
 * may read. Other apps' workspace groups have group props of their own, so everything but this
 * is meaningless to a shared workspace.
 */
export type PatientBannerGroupProps = Partial<Pick<PatientWorkspaceGroupProps, 'showPatientBanner'>>;

/**
 * What a shared workspace may read from its group props: the banner mode, and, as a last resort for
 * launches that supply no window props, the patient / visit of the patient chart's group (see
 * `getPatientAndVisitProps`).
 */
export type SharedWorkspaceGroupProps = PatientBannerGroupProps &
  Partial<Pick<PatientWorkspaceGroupProps, 'patient' | 'patientUuid' | 'visitContext'>>;

/**
 * Whether a workspace should render the patient banner itself, as asked for by its workspace group.
 */
export function useShowPatientBanner(groupProps: PatientBannerGroupProps | null | undefined): boolean {
  const isTablet = useLayoutType() === 'tablet';
  const showPatientBanner: PatientBannerMode = groupProps?.showPatientBanner ?? 'always';
  return showPatientBanner === 'always' || isTablet;
}

/**
 * The window props taken by workspaces that are shared between the patient chart and other apps
 * (ward, service queues, dispensing, ...). Whoever opens the window supplies the patient / visit the
 * workspace acts on; these workspaces read group props only for the patient banner mode and as a last
 * resort when a launch supplies no patient (see `SharedWorkspaceGroupProps`). In the patient chart, use
 * `getPatientChartWindowProps` to build them.
 */
export interface PatientWorkspaceWindowProps {
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
}

/**
 * Window props for the forms dashboard / form entry workspaces (window `patient-chart-clinical-forms`).
 */
export interface ClinicalFormsWindowProps extends PatientWorkspaceWindowProps {
  /**
   * Name of the form entry workspace the forms dashboard launches as a child workspace.
   * Defaults to the patient chart's `patient-form-entry-workspace`.
   */
  formEntryWorkspaceName?: string;
}

/**
 * The patient / visit props that vitals, visit notes, lab results and the visit form used to take as
 * workspace props. They now take them as window props; the workspace-prop versions are only read
 * as a fallback for callers that have not migrated yet.
 * @deprecated Pass `patient` / `patientUuid` / `visitContext` as window props instead.
 */
export type DeprecatedPatientWorkspaceProps = Partial<
  Pick<PatientWorkspaceWindowProps, 'patient' | 'patientUuid' | 'visitContext'>
>;

/**
 * Reads the patient / visit a workspace acts on: window props first, falling back to the
 * deprecated workspace props. The deprecated fallback lives here, so it can be deleted once the
 * apps that still pass workspace props (ward, service queues, appointments, patient lists, lab app) have
 * migrated to window props.
 *
 * Only if the launch supplied no patient at all (neither window props nor workspace props), the group
 * props are used as a whole, patient and visit together. The group's visit is never mixed in with a
 * patient given by the window, as a `visitContext` of null there means "no visit".
 *
 * Don't pass group props for a workspace whose `visitContext` window prop means something other than
 * "the visit the user is working in", such as the visit form, where null means "start a new visit".
 */
export function getPatientAndVisitProps(
  windowProps: Partial<PatientWorkspaceWindowProps> | null | undefined,
  workspaceProps: DeprecatedPatientWorkspaceProps | null | undefined,
  groupProps?: SharedWorkspaceGroupProps | null,
): Pick<PatientWorkspaceWindowProps, 'patient' | 'patientUuid' | 'visitContext'> {
  // Only `undefined` falls through to the next source: a null `visitContext` means "no visit"
  const patient = windowProps?.patient !== undefined ? windowProps.patient : workspaceProps?.patient;
  const patientUuid = windowProps?.patientUuid !== undefined ? windowProps.patientUuid : workspaceProps?.patientUuid;
  const visitContext =
    windowProps?.visitContext !== undefined ? windowProps.visitContext : workspaceProps?.visitContext;
  if (patient || patientUuid) {
    return { patient, patientUuid, visitContext };
  }
  return { patient: groupProps?.patient, patientUuid: groupProps?.patientUuid, visitContext: groupProps?.visitContext };
}

/**
 * Converts the group props of the patient chart into window props.
 */
function groupPropsToWindowProps(groupProps: PatientWorkspaceGroupProps): PatientWorkspaceWindowProps {
  const { patient, patientUuid, visitContext } = groupProps;
  return { patient, patientUuid, visitContext };
}

/**
 * Builds the window props the patient chart supplies when it opens a workspace window, from the
 * group props the workspace group is currently open with. Reads the store when called (not when
 * rendered), so call this at launch time.
 *
 * The group props are used rather than the latest store values because the window props of an open
 * window are compared (shallowly) with the window props of every later launch into that window, and
 * an incompatible launch prompts the user to close the window. The store's `patient` / `visitContext`
 * objects are replaced on every revalidation, while the group props stay the same until the
 * patient or visit changes, so reading the group props keeps launches compatible.
 *
 * If `patientUuid` is omitted, the patient the chart currently has open is used.
 */
export function getPatientChartWindowProps(patientUuid?: string): PatientWorkspaceWindowProps {
  const state = getPatientChartStoreState(patientUuid);
  // The group props are only replaced once a new group launches, so they may still belong to the
  // previous patient right after the chart switched patients. Don't use them in that case.
  if (state?.workspaceGroupProps && state.workspaceGroupProps.patientUuid === state.patientUuid) {
    return groupPropsToWindowProps(state.workspaceGroupProps);
  }
  return {
    patient: state?.patient ?? null,
    patientUuid: state?.patientUuid ?? patientUuid ?? null,
    visitContext: state?.visitContext ?? null,
  };
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
  windowProps,
}: {
  patientUuid: string;
  workspaceName: string;
  dashboardName?: string;
  additionalProps?: object;
  /** Window props to launch the workspace with. Workspaces that need the patient or visit read them from here. */
  windowProps?: object;
}) {
  launchWorkspace2(workspaceName, additionalProps, windowProps);
  navigate({ to: '${openmrsSpaBase}/patient/' + `${patientUuid}/chart` + (dashboardName ? `/${dashboardName}` : '') });
}

/**
 * Returns a callback that launches the workspace, first prompting the user to start a visit if the
 * patient needs one. The patient / visit window props (see `getPatientChartWindowProps`) are supplied
 * by default; any `windowProps` passed to the callback take precedence.
 */
export function useLaunchWorkspaceRequiringVisit<T extends object>(patientUuid: string, workspaceName: string) {
  const startVisitIfNeeded = useStartVisitIfNeeded(patientUuid);
  const launchPatientWorkspaceCb = useCallback(
    (workspaceProps?: T, windowProps?: any, groupProps?: any) => {
      startVisitIfNeeded().then((didStartVisit) => {
        if (didStartVisit) {
          // Read at launch time: the visit may have just been started by the prompt above.
          launchWorkspace2(
            workspaceName,
            workspaceProps,
            { ...getPatientChartWindowProps(patientUuid), ...windowProps },
            groupProps,
          );
        }
      });
    },
    [startVisitIfNeeded, workspaceName, patientUuid],
  );
  return launchPatientWorkspaceCb;
}

/**
 * Props for an `ActionMenuButton2` that opens a workspace requiring a visit, bridging the group props
 * the button receives to the window props the workspace takes:
 *
 * ```tsx
 * <ActionMenuButton2 {...useActionMenuButtonLaunchProps(groupProps, 'order-basket')} icon={...} label={...} />
 * ```
 *
 * `ActionMenuButton2` launches with the `workspaceToLaunch` of the render the button was clicked in. If the
 * user starts a visit in the prompt, the chart relaunches its workspace group and the button re-renders, but
 * that click handler still holds the old (visit-less) props. So when the visit changed during the prompt,
 * `onBeforeWorkspaceLaunch` launches the workspace itself with the window props read after the prompt, and
 * returns false so the button does not launch with the stale ones.
 *
 * TODO: remove the second launch path once `ActionMenuButton2` can take window props that are evaluated at
 * launch time.
 */
export function useActionMenuButtonLaunchProps<T extends object>(
  groupProps: PatientWorkspaceGroupProps,
  workspaceName: string,
  workspaceProps?: T,
) {
  const { patientUuid } = groupProps;
  const startVisitIfNeeded = useStartVisitIfNeeded(patientUuid);
  const windowProps = groupPropsToWindowProps(groupProps);
  const visitUuid = windowProps.visitContext?.uuid;

  const onBeforeWorkspaceLaunch = useCallback(async () => {
    if (!(await startVisitIfNeeded())) {
      return false;
    }
    const currentWindowProps = getPatientChartWindowProps(patientUuid);
    if (currentWindowProps.visitContext?.uuid === visitUuid) {
      return true;
    }
    launchWorkspace2(workspaceName, workspaceProps, currentWindowProps);
    return false;
  }, [startVisitIfNeeded, patientUuid, visitUuid, workspaceName, workspaceProps]);

  return {
    workspaceToLaunch: { workspaceName, workspaceProps, windowProps },
    onBeforeWorkspaceLaunch,
  };
}

export function useStartVisitIfNeeded(patientUuid: string) {
  const { visitContext, workspaceGroupVisitUuid } = usePatientChartStore(patientUuid);
  const { systemVisitEnabled } = useSystemVisitSetting();
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

        const dispose = showModal('start-visit-dialog', {
          closeModal: () => dispose(),
          onCancel: () => {
            dispose();
            resolve(false);
          },
          onVisitStarted: resolveOnceWorkspaceGroupHasVisit,
          patientUuid,
        });
      });
    }
  }, [visitContext, systemVisitEnabled, patientUuid]);
  return startVisitIfNeeded;
}
