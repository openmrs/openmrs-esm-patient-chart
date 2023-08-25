import { useEffect, useState } from 'react';
import { getWorkspaceStore, WorkspaceNavButtonProperties, type WorkspaceStoreState } from '../workspaces';

export function useWorkspaceNavButtons(name: string): WorkspaceNavButtonProperties {
  const [workspaceNavButton, setWorkspaceNavButton] = useState<WorkspaceNavButtonProperties>({
    showAlertBadge: false,
  });

  useEffect(() => {
    function update(state: WorkspaceStoreState) {
      setWorkspaceNavButton(state.workspaceNavButtons[name] ?? { showAlertBadge: false });
    }
    update(getWorkspaceStore().getState());
    getWorkspaceStore().subscribe(update);
  }, [name]);

  return workspaceNavButton;
}
