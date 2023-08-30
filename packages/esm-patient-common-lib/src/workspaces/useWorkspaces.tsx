import { useEffect, useMemo, useState } from 'react';
import { getWorkspaceStore, OpenWorkspace, WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import { Prompt, WorkspaceStoreState } from './workspaces';
import { useStoreWithActions } from '@openmrs/esm-framework';

export interface WorkspacesInfo {
  active: boolean;
  workspaceWindowState: WorkspaceWindowState;
  workspaces: Array<OpenWorkspace>;
  prompt: Prompt;
  updateWorkspaceWindowState: (val: WorkspaceWindowState) => void;
}

export function useWorkspaces(): WorkspacesInfo {
  const {
    prompt,
    openWorkspaces: workspaces,
    workspaceWindowState,
    // updateWorkspaceWindowState isn't memoised
    updateWorkspaceWindowState,
  } = useStoreWithActions<WorkspaceStoreState>(getWorkspaceStore(), {
    updateWorkspaceWindowState: (state, value) => ({ ...state, workspaceWindowState: value }),
  });

  // This hook is meant to be triggered only when workspace changes
  // Accordingly the workspaceWindowState will be updated
  useEffect(() => {
    if (workspaces.length === 0) {
      updateWorkspaceWindowState('hidden');
    } else if (workspaceWindowState === 'hidden') {
      updateWorkspaceWindowState('normal');
    } else {
      updateWorkspaceWindowState(workspaces[0].preferredWindowSize === 'maximized' ? 'maximized' : 'normal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces]);

  const memoisedResults = useMemo(
    () => ({
      active: workspaces.length > 0,
      workspaceWindowState,
      workspaces,
      prompt,
      updateWorkspaceWindowState,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaces, workspaceWindowState, prompt],
  );

  return memoisedResults;
}
