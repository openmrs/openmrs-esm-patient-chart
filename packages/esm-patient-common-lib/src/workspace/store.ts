import { createGlobalStore, useAssignedExtensionIds, useStore } from '@openmrs/esm-framework';
import { ScreenModeTypes, WindowSize } from '..';
import { useEffect, useCallback } from 'react';
import { screenMode } from './workspace-utils';

const patientChartWorkspaceSlot = 'patient-chart-workspace-slot';

interface WorkspaceStore {
  windowSize: WindowSize;
}

const workspaceStore = createGlobalStore<WorkspaceStore>('workspace', {
  windowSize: { size: ScreenModeTypes.normal },
});

export const updateWindowSize = workspaceStore.action((state, screenMode: ScreenModeTypes) => {
  const value = screenMode === ScreenModeTypes.minimize ? ScreenModeTypes.normal : screenMode;
  return {
    ...state,
    windowSize: { size: value },
  };
});

export const useWorkspaceStore = () => {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);

  const active = extensions.length > 0;

  const isWorkspaceOpen = useCallback(
    (workspaceName: string) => {
      return extensions.some((ext) => ext.toLowerCase() === workspaceName.toLowerCase()) && extensions.length > 0;
    },
    [extensions],
  );

  const isFormsWorkspace = useCallback(
    () =>
      extensions.filter((ext) => !(ext === 'visit-notes-form-workspace' || ext === 'order-basket-workspace')).length >
      0,
    [extensions],
  );

  useEffect(() => {
    const mode = screenMode(extensions);
    updateWindowSize(mode);
  }, [extensions]);

  const store = useStore(workspaceStore);
  const { windowSize } = store;

  return { workspaceStore: store, updateWindowSize, active, isWorkspaceOpen, isFormsWorkspace, windowSize };
};
