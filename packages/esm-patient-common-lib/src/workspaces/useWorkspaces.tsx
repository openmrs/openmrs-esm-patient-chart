import { useEffect, useMemo, useState } from 'react';
import {
  getWorkspaceStore,
  closeWorkspace,
  OpenWorkspace,
  WorkspaceWindowState,
} from '@openmrs/esm-patient-common-lib';
import { WorkspaceStoreState } from '.';

export interface WorkspacesInfo {
  active: boolean;
  windowState: WorkspaceWindowState;
  workspaces: Array<OpenWorkspace>;
  workspaceNeedingConfirmationToOpen: OpenWorkspace;
}

export function useWorkspaces(): WorkspacesInfo {
  const [workspaces, setWorkspaces] = useState<Array<OpenWorkspace>>([]);
  const [workspaceNeedingConfirmationToOpen, setWorkspaceNeedingConfirmationToOpen] = useState<OpenWorkspace>(null);

  useEffect(() => {
    function update(state: WorkspaceStoreState) {
      setWorkspaces(state.openWorkspaces.map((w) => ({ ...w, closeWorkspace: () => closeWorkspace(w.name) })));
      setWorkspaceNeedingConfirmationToOpen(state.workspaceNeedingConfirmationToOpen);
    }
    update(getWorkspaceStore().getState());
    getWorkspaceStore().subscribe(update);
  }, []);

  const windowState = useMemo(() => {
    if (workspaces.length === 0) {
      return WorkspaceWindowState.hidden;
    } else if (workspaces.length === 1) {
      return workspaces[0].preferredWindowSize;
    }
  }, [workspaces]);

  return {
    active: workspaces.length > 0,
    windowState,
    workspaces,
    workspaceNeedingConfirmationToOpen,
  };
}
