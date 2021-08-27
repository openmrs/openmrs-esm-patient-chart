import { useCallback, useMemo } from 'react';
import { detachAll, extensionStore, useAssignedExtensionIds } from '@openmrs/esm-framework';
import { patientChartWorkspaceSlot } from '../constants';
import { getTitle, checkScreenMode } from '../utils';

export interface WorkspaceState {
  title: string;
  active: boolean;
  screenMode: string;
}

export interface WorkspaceDetails extends WorkspaceState {
  closeWorkspace(): void;
  extensions: Array<string>;
}

export function useWorkspace(): WorkspaceDetails {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);

  const title = useMemo(() => {
    if (extensions.length === 0) {
      return '';
    } else if (extensions.length === 1) {
      const state = extensionStore.getState();
      return getTitle(state.extensions[extensions[0]]);
    } else {
      return `Workspaces (${extensions.length})`;
    }
  }, [extensions]);

  const screenMode = useMemo(() => {
    if (extensions.length === 0) {
      return '';
    } else if (extensions.length === 1) {
      const state = extensionStore.getState();
      return checkScreenMode(state.extensions[extensions[0]]);
    } else {
      return `Workspaces (${extensions.length})`;
    }
  }, [extensions]);

  const closeWorkspace = useCallback(() => detachAll(patientChartWorkspaceSlot), []);

  return {
    title,
    screenMode,
    active: extensions.length > 0,
    closeWorkspace,
    extensions,
  };
}
