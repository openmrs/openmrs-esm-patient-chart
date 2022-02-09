import { ExtensionRegistration, getExtensionRegistration, getGlobalStore, translateFrom } from '@openmrs/esm-framework';
import { WorkspaceWindowState } from '..';

export interface WorkspaceStoreState {
  openWorkspaces: Array<OpenWorkspace>;
  workspaceNeedingConfirmationToOpen: OpenWorkspace | null;
}

export interface OpenWorkspace extends WorkspaceRegistration {
  additionalProps: object;
  closeWorkspace(): void;
}

export interface WorkspaceRegistration {
  name: string;
  title: string;
  /** Use `getLifecycle` or `getAsyncLifecycle` to get the value of `load` */
  load(): Promise<any>;
  /** Only one of each "type" of workspace is allowed to be open at a time. The default is "form" */
  type?: string;
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
    preferredWindowSize: workspace.preferredWindowSize ?? WorkspaceWindowState.normal,
    type: workspace.type ?? 'form',
  };
}

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
      return {
        name: workspaceExtension.name,
        title: getTitleFromExtension(workspaceExtension),
        preferredWindowSize: workspaceExtension.meta?.screenSize ?? WorkspaceWindowState.normal,
        load: workspaceExtension.load,
        type: workspaceExtension.meta?.type ?? 'form',
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
 * Given a workspace specified by its name:
 *
 * - If no workspaces are open, or if no other workspaces with the same type are open,
 *   it will be opened and focused.
 * - If a workspace with the same name is already open, it will be displayed/focused,
 *   if it was not already.
 * - If another workspace with the same type is open, a confirmation modal will pop up a
 *   warning about closing the currently open workspace.
 *
 * Note that this function just manipulates the workspace store. The UI logic based on
 * the workspace store is contained in esm-patient-chart-app.
 *
 * @param name The name of the workspace to launch
 * @param additionalProps Props to pass to the workspace component being launched
 */
export function launchPatientWorkspace(name: string, additionalProps?: object) {
  const store = getWorkspaceStore();
  const state = store.getState();
  const workspace = getWorkspaceRegistration(name);
  const newWorkspace = {
    ...workspace,
    closeWorkspace: () => closeWorkspace(name),
    additionalProps,
  };
  if (state.openWorkspaces.filter((w) => w.type == newWorkspace.type).length == 0) {
    store.setState({ ...state, openWorkspaces: [newWorkspace, ...state.openWorkspaces] });
  } else {
    const existingIdx = state.openWorkspaces.findIndex((w) => w.name == name);
    if (existingIdx >= 0) {
      const restOfWorkspaces = [...state.openWorkspaces];
      restOfWorkspaces.splice(existingIdx, 1);
      const openWorkspaces = [state.openWorkspaces[existingIdx], ...restOfWorkspaces];
      store.setState({ ...state, openWorkspaces });
    } else {
      store.setState({ ...state, workspaceNeedingConfirmationToOpen: newWorkspace });
    }
  }
}

export function confirmOpeningWorkspace() {
  const store = getWorkspaceStore();
  const state = store.getState();
  const newWorkspace = state.workspaceNeedingConfirmationToOpen;
  store.setState({
    openWorkspaces: [newWorkspace, ...state.openWorkspaces.filter((w) => w.type != newWorkspace.type)],
    workspaceNeedingConfirmationToOpen: null,
  });
}

export function cancelOpeningWorkspace() {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, workspaceNeedingConfirmationToOpen: null });
}

export function closeWorkspace(name: string) {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, openWorkspaces: state.openWorkspaces.filter((w) => w.name != name) });
}

export function closeAllWorkspaces() {
  const store = getWorkspaceStore();
  store.setState({ openWorkspaces: [] });
}

export interface WorkspaceParcel {
  unmount: () => void;
  update: (props) => Promise<any>;
}

const initialState = { openWorkspaces: [], workspaceNeedingConfirmationToOpen: null };
export function getWorkspaceStore() {
  return getGlobalStore<WorkspaceStoreState>('workspace', initialState);
}

/**
 * @internal
 * Just for testing.
 */
export function resetWorkspaceStore() {
  getWorkspaceStore().setState(initialState);
}
