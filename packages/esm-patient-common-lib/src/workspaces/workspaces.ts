import { type ExtensionRegistration, getGlobalStore, navigate, translateFrom } from '@openmrs/esm-framework';
// FIXME We should not rely on internals here
import { getExtensionRegistration } from '@openmrs/esm-framework/src/internal';
import _i18n from 'i18next';
import { type WorkspaceWindowState, type CloseWorkspaceOptions } from '../types/workspace';

export interface Prompt {
  title: string;
  body: string;
  /** Defaults to "Confirm" */
  confirmText?: string;
  onConfirm(): void;
  /** Defaults to "Cancel" */
  cancelText?: string;
}

export interface WorkspaceStoreState {
  patientUuid: string | null;
  openWorkspaces: Array<OpenWorkspace>;
  prompt: Prompt | null;
  workspaceWindowState: WorkspaceWindowState;
}

export interface OpenWorkspace extends WorkspaceRegistration {
  additionalProps: object;
  closeWorkspace(closeWorkspaceOptions?: CloseWorkspaceOptions): boolean;
  closeWorkspaceWithSavedChanges(closeWorkspaceOptions?: CloseWorkspaceOptions): boolean;
  promptBeforeClosing(testFcn: () => boolean): void;
}

export interface WorkspaceRegistration {
  name: string;
  title: string;
  /** Use `getLifecycle` or `getAsyncLifecycle` to get the value of `load` */
  load(): Promise<any>;
  /** Only one of each "type" of workspace is allowed to be open at a time. The default is "form" */
  type?: string;
  canHide?: boolean;
  canMaximize?: boolean;
  width?: 'narrow' | 'wider';
  preferredWindowSize?: WorkspaceWindowState;
}

let registeredWorkspaces: Record<string, WorkspaceRegistration> = {};

/**
 * Tells the workspace system about a workspace. Should be called at the top level
 * of a module which will be loaded whenever the patient chart loads.
 */
export function registerWorkspace(workspace: WorkspaceRegistration) {
  registeredWorkspaces[workspace.name] = {
    ...workspace,
    preferredWindowSize: workspace.preferredWindowSize ?? 'normal',
    type: workspace.type ?? 'form',
    canHide: workspace.canHide ?? false,
    canMaximize: workspace.canMaximize ?? false,
    width: workspace.width ?? 'narrow',
  };
}

const workspaceExtensionWarningsIssued = new Set();
/**
 * This exists for compatibility with the old way of registering
 * workspaces (as extensions).
 *
 * @param name of the workspace
 */
function getWorkspaceRegistration(name: string): WorkspaceRegistration {
  if (registeredWorkspaces[name]) {
    return registeredWorkspaces[name];
  } else {
    const workspaceExtension = getExtensionRegistration(name);
    if (workspaceExtension) {
      if (!workspaceExtensionWarningsIssued.has(name)) {
        console.warn(
          `The workspace '${name}' is registered as an extension. This is deprecated. Please use the 'registerWorkspace' function instead.`,
        );
        workspaceExtensionWarningsIssued.add(name);
      }
      return {
        name: workspaceExtension.name,
        title: getTitleFromExtension(workspaceExtension),
        preferredWindowSize: workspaceExtension.meta?.screenSize ?? 'normal',
        load: workspaceExtension.load,
        type: workspaceExtension.meta?.type ?? 'form',
        canHide: workspaceExtension.meta?.canHide ?? false,
        canMaximize: workspaceExtension.meta?.canMaximize ?? false,
        width: workspaceExtension.meta?.width ?? 'narrow',
      };
    } else {
      throw new Error(`No workspace named '${name}' has been registered.`);
    }
  }
}

function getTitleFromExtension(ext: ExtensionRegistration) {
  const title = ext?.meta?.title;
  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }
  return ext.name;
}

/**
 *
 * @param name Name of the workspace
 * @param ignoreChanges If set to true, the "unsaved changes" modal will never be shown, even if the `promptBeforeClosing` function returns true. The user will not be prompted before closing.
 * @returns true if the workspace can be closed.
 */
export function canCloseWorkspaceWithoutPrompting(name: string, ignoreChanges: boolean = false) {
  if (ignoreChanges) {
    return true;
  }
  const promptBeforeFn = getPromptBeforeClosingFcn(name);
  return !promptBeforeFn || !promptBeforeFn();
}

function promptBeforeLaunchingWorkspace(
  workspace: OpenWorkspace,
  newWorkspaceDetails: { name: string; additionalProps?: object },
) {
  const { name, additionalProps } = newWorkspaceDetails;

  const proceed = () => {
    workspace.closeWorkspace({
      ignoreChanges: true,
      // Calling the launchPatientWorkspace again, since one of the `if` case
      // might resolve, but we need to check all the cases before launching the form.
      onWorkspaceClose: () => launchPatientWorkspace(name, additionalProps),
    });
  };

  if (!canCloseWorkspaceWithoutPrompting(workspace.name)) {
    showWorkspacePrompts('closing-workspace-launching-new-workspace', proceed, workspace.title ?? workspace.name);
  } else {
    proceed();
  }
}

/**
 * Given a workspace specified by its name:
 *
 * - If no workspaces are open, or if no other workspaces with the same type are open,
 *   it will be opened and focused.
 * - If a workspace with the same name is already open, it will be displayed/focused,
 *   if it was not already.
 * - If a workspace is launched and a workspace which cannot be hidden is already open,
 *  a confirmation modal will pop up warning about closing the currently open workspace.
 * - If another workspace with the same type is open, the workspace will be brought to
 *   the front and then a confirmation modal will pop up warning about closing the opened
 *   workspace
 *
 * Note that this function just manipulates the workspace store. The UI logic based on
 * the workspace store is contained in esm-patient-chart-app.
 *
 * @param name The name of the workspace to launch
 * @param additionalProps Props to pass to the workspace component being launched
 */
export function launchPatientWorkspace(name: string, additionalProps?: object) {
  const store = getWorkspaceStore();
  const workspace = getWorkspaceRegistration(name);
  const newWorkspace = {
    ...workspace,
    closeWorkspace: (options: CloseWorkspaceOptions = {}) => closeWorkspace(name, options),
    closeWorkspaceWithSavedChanges: (options: CloseWorkspaceOptions) =>
      closeWorkspace(name, { ignoreChanges: true, ...options }),
    promptBeforeClosing: (testFcn) => promptBeforeClosing(name, testFcn),
    additionalProps,
  };

  const updateStoreWithNewWorkspace = (workspaceToBeAdded: OpenWorkspace, restWorkspaces = null) => {
    store.setState((state) => {
      const openWorkspaces = [workspaceToBeAdded, ...(restWorkspaces ?? state.openWorkspaces)];
      let workspaceWindowState = getUpdatedWorkspaceWindowState(openWorkspaces[0]);

      return {
        ...state,
        openWorkspaces,
        workspaceWindowState,
      };
    });
  };

  const openWorkspaces = store.getState().openWorkspaces;
  const workspaceIndexInOpenWorkspaces = openWorkspaces.findIndex((w) => w.name === name);
  const isWorkspaceAlreadyOpen = workspaceIndexInOpenWorkspaces >= 0;
  const openedWorkspaceWithSameType = openWorkspaces.find((w) => w.type == newWorkspace.type);

  if (openWorkspaces.length === 0) {
    updateStoreWithNewWorkspace(newWorkspace);
  } else if (!openWorkspaces[0].canHide && workspaceIndexInOpenWorkspaces !== 0) {
    promptBeforeLaunchingWorkspace(openWorkspaces[0], {
      name,
      additionalProps,
    });
  } else if (isWorkspaceAlreadyOpen) {
    openWorkspaces[workspaceIndexInOpenWorkspaces].additionalProps = newWorkspace.additionalProps;
    const restOfWorkspaces = openWorkspaces.filter((w) => w.name != name);
    updateStoreWithNewWorkspace(openWorkspaces[workspaceIndexInOpenWorkspaces], restOfWorkspaces);
  } else if (!!openedWorkspaceWithSameType) {
    const restOfWorkspaces = store.getState().openWorkspaces.filter((w) => w.type != newWorkspace.type);
    updateStoreWithNewWorkspace(openedWorkspaceWithSameType, restOfWorkspaces);
    promptBeforeLaunchingWorkspace(openedWorkspaceWithSameType, {
      name,
      additionalProps,
    });
  } else {
    updateStoreWithNewWorkspace(newWorkspace);
  }
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
  changeWorkspaceContext(patientUuid);
  launchPatientWorkspace(workspaceName, additionalProps);
  navigate({ to: '${openmrsSpaBase}/patient/' + `${patientUuid}/chart` + (dashboardName ? `/${dashboardName}` : '') });
}

const promptBeforeClosingFcns = {};

export function promptBeforeClosing(workspaceName: string, testFcn: () => boolean) {
  promptBeforeClosingFcns[workspaceName] = testFcn;
}

export function getPromptBeforeClosingFcn(workspaceName: string) {
  return promptBeforeClosingFcns[workspaceName];
}

export function cancelPrompt() {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, prompt: null });
}

/**
 * Function to close an opened workspace
 * @param name Workspace registration name
 * @param options Options to close workspace
 * @returns
 */
export function closeWorkspace(
  name: string,
  options: CloseWorkspaceOptions = {
    ignoreChanges: false,
    onWorkspaceClose: () => {},
  },
): boolean {
  const store = getWorkspaceStore();

  const updateStoreWithClosedWorkspace = () => {
    const state = store.getState();
    const newOpenWorkspaces = state.openWorkspaces.filter((w) => w.name != name);

    // promptBeforeClosing function should be removed if the workspace is closed.
    promptBeforeClosing(name, null);
    store.setState({
      ...state,
      prompt: null,
      openWorkspaces: newOpenWorkspaces,
      workspaceWindowState: getUpdatedWorkspaceWindowState(newOpenWorkspaces?.[0]),
    });

    options?.onWorkspaceClose?.();
  };

  if (!canCloseWorkspaceWithoutPrompting(name, options?.ignoreChanges)) {
    const currentName = getWorkspaceRegistration(name).title ?? name;
    showWorkspacePrompts('closing-workspace', updateStoreWithClosedWorkspace, currentName);
    return false;
  } else {
    updateStoreWithClosedWorkspace();
    return true;
  }
}

/**
 * The set of workspaces is specific to a particular patient. This function
 * should be used when setting up workspaces for a new patient. If the current
 * workspace data is for a different patient, the workspace state is cleared.
 */
export function changeWorkspaceContext(patientUuid) {
  const store = getWorkspaceStore();
  const state = store.getState();
  if (state.patientUuid != patientUuid) {
    store.setState({ patientUuid, openWorkspaces: [], prompt: null });
  }
}

const initialState: WorkspaceStoreState = {
  patientUuid: null,
  openWorkspaces: [],
  prompt: null,
  workspaceWindowState: 'normal',
};
export function getWorkspaceStore() {
  return getGlobalStore<WorkspaceStoreState>('workspace', initialState);
}

export function updateWorkspaceWindowState(value: WorkspaceWindowState) {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, workspaceWindowState: value });
}

function getUpdatedWorkspaceWindowState(workspaceAtTop: OpenWorkspace) {
  return workspaceAtTop?.preferredWindowSize ?? 'normal';
}
export function closeAllWorkspaces(onClosingWorkspaces: () => void = () => {}) {
  const store = getWorkspaceStore();

  const canCloseAllWorkspaces = store.getState().openWorkspaces.every(({ name }) => {
    const canCloseWorkspace = canCloseWorkspaceWithoutPrompting(name);
    return canCloseWorkspace;
  });

  const updateWorkspaceStore = () => {
    resetWorkspaceStore();
    onClosingWorkspaces?.();
  };

  if (!canCloseAllWorkspaces) {
    showWorkspacePrompts('closing-all-workspaces', updateWorkspaceStore);
  } else {
    updateWorkspaceStore();
  }
}

type PromptType = 'closing-workspace' | 'closing-all-workspaces' | 'closing-workspace-launching-new-workspace';

/**
 * Which type of prompt should be shown to the user.
 * @param promptType 'closing-workspace' | 'closing-all-workspaces' | 'closing-workspace-launching-new-workspace'
 * @param onConfirmation Function to be called after the user confirms to close the workspace
 * @param workspaceTitle Workspace title to be shown in the prompt
 * @returns
 */

export function showWorkspacePrompts(
  promptType: PromptType,
  onConfirmation: () => void = () => {},
  workspaceTitle: string = '',
) {
  const store = getWorkspaceStore();

  switch (promptType) {
    case 'closing-workspace': {
      const prompt: Prompt = {
        title: translateFrom('@openmrs/esm-patient-chart-app', 'unsavedChangesTitleText', 'Unsaved Changes'),
        body: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'unsavedChangesInOpenedWorkspace',
          `You have unsaved changes in the opened workspace. Do you want to discard these changes?`,
        ),
        onConfirm: () => {
          onConfirmation?.();
        },
        confirmText: translateFrom('@openmrs/esm-patient-chart-app', 'discard', 'Discard'),
      };
      store.setState({ ...store.getState(), prompt });
      store.setState((prevState) => ({ ...prevState, prompt }));
      return;
    }

    case 'closing-all-workspaces': {
      const workspacesNotClosed = store
        .getState()
        .openWorkspaces.filter(({ name }) => !canCloseWorkspaceWithoutPrompting(name))
        .map(({ title }, indx) => `${indx + 1}. ${title}`);

      const prompt: Prompt = {
        title: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'closingAllWorkspacesPromptTitle',
          'You have unsaved changes',
        ),
        body: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'closingAllWorkspacesPromptBody',
          'There are unsaved changes in the following workspaces. Do you want to discard changes in the following workspaces? {{workspaceNames}}',
          {
            workspaceNames: workspacesNotClosed.join(','),
          },
        ),
        onConfirm: () => {
          onConfirmation?.();
        },
        confirmText: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'closeAllOpenedWorkspaces',
          'Discard changes in {{count}} workspaces',
          { count: workspacesNotClosed.length },
        ),
      };
      store.setState((prevState) => ({
        ...prevState,
        prompt,
      }));
      return;
    }
    case 'closing-workspace-launching-new-workspace': {
      const prompt: Prompt = {
        title: translateFrom('@openmrs/esm-patient-chart-app', 'unsavedChangesTitleText', 'Unsaved Changes'),
        body: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'unsavedChangesInWorkspace',
          'There are unsaved changes in {{workspaceName}}. Please save them before opening another workspace.',
          { workspaceName: workspaceTitle },
        ),
        onConfirm: () => {
          store.setState((prevState) => ({
            ...prevState,
            prompt: null,
          }));
          onConfirmation?.();
        },
        confirmText: translateFrom('@openmrs/esm-patient-chart-app', 'openAnyway', 'Open anyway'),
      };
      store.setState((prevState) => ({
        ...prevState,
        prompt,
      }));
      return;
    }
    default: {
      onConfirmation?.();
      return;
    }
  }
}

/**
 * @internal
 * Just for testing.
 */
export function resetWorkspaceStore() {
  getWorkspaceStore().setState(initialState);
}
