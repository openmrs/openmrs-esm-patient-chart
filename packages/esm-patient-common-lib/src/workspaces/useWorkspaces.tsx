import { useEffect, useMemo, useState } from 'react';
import { getWorkspaceStore, OpenWorkspace, WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import { Prompt, WorkspaceStoreState, updateWorkspaceWindowState } from './workspaces';

export interface WorkspacesInfo {
  active: boolean;
  workspaceWindowState: WorkspaceWindowState;
  workspaces: Array<OpenWorkspace>;
  prompt: Prompt;
}

export function useWorkspaces(): WorkspacesInfo {
  const [workspaces, setWorkspaces] = useState<Array<OpenWorkspace>>([]);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [workspaceWindowState, setWorkspaceWindowState] = useState<WorkspaceWindowState>('hidden');

  useEffect(() => {
    function update(state: WorkspaceStoreState) {
      setWorkspaces(state.openWorkspaces);
      setPrompt(state.prompt);
      setWorkspaceWindowState(state.workspaceWindowState);
    }
    update(getWorkspaceStore().getState());
    getWorkspaceStore().subscribe(update);
  }, []);

  const memoisedResults = useMemo(
    () => ({
      active: workspaces.length > 0,
      workspaceWindowState,
      workspaces,
      prompt,
    }),
    [workspaces, workspaceWindowState, prompt],
  );

  return memoisedResults;
}
