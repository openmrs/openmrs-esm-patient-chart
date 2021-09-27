import { useCallback, useMemo } from 'react';
import { detachAll, extensionStore, useAssignedExtensionIds } from '@openmrs/esm-framework';
import { patientChartWorkspaceSlot } from '../constants';
import { getTitle, checkScreenMode } from '../utils';
import { ScreenModeTypes } from '../types';

export interface WorkspaceState {
  title: string;
  active: boolean;
  screenMode: ScreenModeTypes;
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
      return ScreenModeTypes.hide;
    } else if (extensions.length === 1) {
      const state = extensionStore.getState();
      return checkScreenMode(state.extensions[extensions[0]]);
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
