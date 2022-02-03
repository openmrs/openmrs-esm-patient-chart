import { useAssignedExtensionIds } from '@openmrs/esm-framework';
import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { patientChartWorkspaceSlot } from '../../esm-patient-chart-app/src/constants';
import { useWorkspace } from '../../esm-patient-chart-app/src/hooks/useWorkspace';
import { WorkspaceWindowState } from '../../esm-patient-chart-app/src/types';

interface WindowSize {
  size: WorkspaceWindowState;
}

interface WorkspaceWindowSizeContextShape {
  windowSize: WindowSize;
  updateWindowSize?(value: WorkspaceWindowState): any;
  openWindows: number;
}

const reducer = (state: WindowSize, action: WorkspaceWindowState) => {
  switch (action) {
    case WorkspaceWindowState.minimized:
    case WorkspaceWindowState.reopened:
      return { size: WorkspaceWindowState.normal };
    default:
      return { size: action };
  }
};

const WorkspaceWindowSizeContext = createContext<WorkspaceWindowSizeContextShape>({
  windowSize: { size: WorkspaceWindowState.normal },
  openWindows: 0,
});

export const useWorkspaceWindow = () => {
  const value = useContext(WorkspaceWindowSizeContext);
  return value;
};

export const WorkspaceWindowSizeProvider: React.FC = ({ children }) => {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);
  const initialValue: WindowSize = { size: WorkspaceWindowState.normal };
  const [workspaceWindowSize, updateWorkspaceWindowSize] = React.useReducer(reducer, initialValue);
  const { windowState: screenMode } = useWorkspace();

  useEffect(() => {
    if (extensions.length > 0 && screenMode === WorkspaceWindowState.maximized) {
      updateWorkspaceWindowSize(WorkspaceWindowState.maximized);
    } else {
      updateWorkspaceWindowSize(WorkspaceWindowState.reopened);
    }
  }, [extensions.length, screenMode]);

  const updateWindowSize = useCallback((action: WorkspaceWindowState) => {
    updateWorkspaceWindowSize(action);
  }, []);

  const windowSizeValue = useMemo(() => {
    return {
      windowSize: workspaceWindowSize,
      updateWindowSize: updateWindowSize,
      openWindows: extensions.length,
    };
  }, [workspaceWindowSize, extensions.length, updateWindowSize]);

  return <WorkspaceWindowSizeContext.Provider value={windowSizeValue}>{children}</WorkspaceWindowSizeContext.Provider>;
};
