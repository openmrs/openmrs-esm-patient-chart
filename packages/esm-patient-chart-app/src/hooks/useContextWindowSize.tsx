import { useAssignedExtensionIds } from '@openmrs/esm-framework';
import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { patientChartWorkspaceSlot } from '../constants';

interface WindowSize {
  size: string;
}
type ActionTypes = 'minimize' | 'maximize' | 'hide' | 'reopen';

interface ContextWindowSizeContextShape {
  windowSize: WindowSize;
  updateWindowSize?(value: ActionTypes): any;
  openWindows: number;
}

const reducer = (state: WindowSize, action: ActionTypes) => {
  switch (action) {
    case 'maximize':
      return { size: 'maximize' };
    case 'minimize':
      return { size: 'normal' };
    case 'hide':
      return { size: 'hide' };
    case 'reopen':
      return { size: 'normal' };
  }
};

const ContextWindowSizeContext = createContext<ContextWindowSizeContextShape>({
  windowSize: { size: 'normal' },
  openWindows: 0,
});

export const useContextWorkspace = () => {
  const value = useContext(ContextWindowSizeContext);
  return value;
};

export const ContextWindowSizeProvider: React.FC = ({ children }) => {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);
  const initialValue: WindowSize = { size: 'normal' };
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, initialValue);

  useEffect(() => {
    if (extensions.length > 0) {
      updateContextWorkspaceWindowSize('reopen');
    }
  }, [extensions.length]);

  const updateWindowSize = useCallback((action: ActionTypes) => {
    updateContextWorkspaceWindowSize(action);
  }, []);

  const windowSizeValue = useMemo(() => {
    return {
      windowSize: contextWorkspaceWindowSize,
      updateWindowSize: updateWindowSize,
      openWindows: extensions.length,
    };
  }, [contextWorkspaceWindowSize, extensions.length, updateWindowSize]);

  return <ContextWindowSizeContext.Provider value={windowSizeValue}>{children}</ContextWindowSizeContext.Provider>;
};
