import { useCallback, useMemo } from 'react';
import { detachAll, getExtensionInternalStore, useAssignedExtensions } from '@openmrs/esm-framework';
import { patientChartWorkspaceSlot } from '../constants';
import { getTitle, determineWindowState } from '../utils';
import { WorkspaceWindowState } from '../types';

export interface WorkspaceState {
  active: boolean;
  title: string;
  windowState: WorkspaceWindowState;
}

export interface WorkspaceDetails extends WorkspaceState {
  closeWorkspace(): void;
  extensions: Array<string>;
}

export function useWorkspace(): WorkspaceDetails {
  const extensions = useAssignedExtensions(patientChartWorkspaceSlot);

  const title = useMemo(() => {
    if (extensions.length === 0) {
      return '';
    } else if (extensions.length === 1) {
      const state = getExtensionInternalStore().getState();
      return getTitle(state.extensions[extensions[0].name]);
    } else {
      return `Workspaces (${extensions.length})`;
    }
  }, [extensions]);

  const windowState = useMemo(() => {
    if (extensions.length === 0) {
      return WorkspaceWindowState.hidden;
    } else if (extensions.length === 1) {
      const state = getExtensionInternalStore().getState();
      return determineWindowState(state.extensions[extensions[0].name]);
    }
  }, [extensions]);

  const closeWorkspace = useCallback(() => detachAll(patientChartWorkspaceSlot), []);

  return {
    active: extensions.length > 0,
    closeWorkspace,
    extensions: extensions.map(e => e.name),
    title,
    windowState,
  };
}
