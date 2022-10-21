import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useWorkspaces } from './useWorkspaces';
import { WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';

interface WorkspaceWindowSize {
  size: WorkspaceWindowState;
}

interface WorkspaceWindowSizeProviderProps {
  children?: React.ReactNode;
}

interface WorkspaceWindowSizeContext {
  windowSize: WorkspaceWindowSize;
  updateWindowSize?(value: WorkspaceWindowState): any;
  active: boolean;
}

function reducer(state: WorkspaceWindowSize, action: WorkspaceWindowState): WorkspaceWindowSize {
  switch (action) {
    case 'minimized':
    case 'reopened':
      return { size: 'normal' };
    default:
      return { size: action };
  }
}

const WorkspaceWindowSizeContext = createContext<WorkspaceWindowSizeContext>({
  windowSize: { size: 'normal' },
  active: false,
});

export const useWorkspaceWindowSize = () => {
  const value = useContext(WorkspaceWindowSizeContext);
  return value;
};

export const WorkspaceWindowSizeProvider: React.FC<WorkspaceWindowSizeProviderProps> = ({ children }) => {
  const initialValue: WorkspaceWindowSize = { size: 'normal' };
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, initialValue);
  const { workspaces, windowState, active } = useWorkspaces();

  useEffect(() => {
    if (workspaces.length > 0 && windowState === 'maximized') {
      updateContextWorkspaceWindowSize('maximized');
    } else {
      updateContextWorkspaceWindowSize('reopened');
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
