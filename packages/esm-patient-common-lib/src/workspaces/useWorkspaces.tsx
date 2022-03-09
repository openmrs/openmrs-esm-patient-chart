import { useEffect, useMemo, useState } from 'react';
import { getWorkspaceStore, OpenWorkspace, WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import { Prompt, WorkspaceStoreState } from './workspaces';

export interface WorkspacesInfo {
  active: boolean;
  windowState: WorkspaceWindowState;
  workspaces: Array<OpenWorkspace>;
  prompt: Prompt;
}

export function useWorkspaces(): WorkspacesInfo {
  const [workspaces, setWorkspaces] = useState<Array<OpenWorkspace>>([]);
  const [prompt, setPrompt] = useState<Prompt>(null);

  useEffect(() => {
    function update(state: WorkspaceStoreState) {
      setWorkspaces(state.openWorkspaces);
      setPrompt(state.prompt);
    }
    update(getWorkspaceStore().getState());
    getWorkspaceStore().subscribe(update);
  }, []);

  const windowState = useMemo(() => {
    if (workspaces.length === 0) {
      return 'hidden';
    } else {
      return workspaces[0].preferredWindowSize;
    }
  }, [workspaces]);

  return {
    active: workspaces.length > 0,
    windowState,
    workspaces,
    prompt,
  };
}
