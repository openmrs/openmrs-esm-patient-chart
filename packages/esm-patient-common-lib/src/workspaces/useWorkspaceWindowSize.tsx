import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useWorkspaces } from './useWorkspaces';
import { WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';

interface WorkspaceWindowSize {
  size: WorkspaceWindowState;
}

interface WorkspaceWindowSizeContext {
  windowSize: WorkspaceWindowSize;
  updateWindowSize?(value: WorkspaceWindowState): any;
  active: boolean;
}

const reducer = (state: WorkspaceWindowSize, action: WorkspaceWindowState) => {
  switch (action) {
    case WorkspaceWindowState.minimized:
    case WorkspaceWindowState.reopened:
      return { size: WorkspaceWindowState.normal };
    default:
      return { size: action };
  }
};

const WorkspaceWindowSizeContext = createContext<WorkspaceWindowSizeContext>({
  windowSize: { size: WorkspaceWindowState.normal },
  active: false,
});

export const useWorkspaceWindowSize = () => {
  const value = useContext(WorkspaceWindowSizeContext);
  return value;
};

export const WorkspaceWindowSizeProvider: React.FC = ({ children }) => {
  const initialValue: WorkspaceWindowSize = { size: WorkspaceWindowState.normal };
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, initialValue);
  const { workspaces, windowState, active } = useWorkspaces();

  useEffect(() => {
    if (workspaces.length > 0 && windowState === WorkspaceWindowState.maximized) {
      updateContextWorkspaceWindowSize(WorkspaceWindowState.maximized);
    } else {
      updateContextWorkspaceWindowSize(WorkspaceWindowState.reopened);
    }
  }, [workspaces.length, windowState]);

  const updateWindowSize = useCallback((action: WorkspaceWindowState) => {
    updateContextWorkspaceWindowSize(action);
  }, []);

  const windowSizeValue = useMemo(() => {
    return {
      windowSize: contextWorkspaceWindowSize,
      updateWindowSize: updateWindowSize,
      active,
    };
  }, [contextWorkspaceWindowSize, updateWindowSize, active]);

  return <WorkspaceWindowSizeContext.Provider value={windowSizeValue}>{children}</WorkspaceWindowSizeContext.Provider>;
};
