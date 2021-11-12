import { useAssignedExtensionIds } from '@openmrs/esm-framework';
import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { patientChartWorkspaceSlot } from '../constants';
import { useWorkspace } from '../hooks/useWorkspace';
import { ScreenModeTypes } from '../types';
import { WindowSize } from '@openmrs/esm-patient-common-lib';

interface ContextWindowSizeContextShape {
  windowSize: WindowSize;
  updateWindowSize?(value: ScreenModeTypes): any;
  openWindows: number;
  screenMode: ScreenModeTypes;
}

const reducer = (state: WindowSize, action: ScreenModeTypes) => {
  switch (action) {
    case ScreenModeTypes.minimize:
    case ScreenModeTypes.reopen:
      return { size: ScreenModeTypes.normal };
    default:
      return { size: action };
  }
};

const ContextWindowSizeContext = createContext<ContextWindowSizeContextShape>({
  windowSize: { size: ScreenModeTypes.normal },
  openWindows: 0,
  screenMode: ScreenModeTypes.normal,
});

export const useContextWorkspace = () => {
  const value = useContext(ContextWindowSizeContext);
  return value;
};

export const ContextWindowSizeProvider: React.FC = ({ children }) => {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);
  const initialValue: WindowSize = { size: ScreenModeTypes.normal };
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, initialValue);
  const { screenMode } = useWorkspace();

  useEffect(() => {
    if (extensions.length > 0 && screenMode === ScreenModeTypes.maximize) {
      updateContextWorkspaceWindowSize(ScreenModeTypes.maximize);
    } else {
      updateContextWorkspaceWindowSize(ScreenModeTypes.reopen);
    }
  }, [extensions.length, screenMode]);

  const updateWindowSize = useCallback((action: ScreenModeTypes) => {
    updateContextWorkspaceWindowSize(action);
  }, []);

  const windowSizeValue = useMemo(() => {
    return {
      windowSize: contextWorkspaceWindowSize,
      updateWindowSize: updateWindowSize,
      openWindows: extensions.length,
      screenMode,
    };
  }, [contextWorkspaceWindowSize, extensions.length, screenMode, updateWindowSize]);

  return <ContextWindowSizeContext.Provider value={windowSizeValue}>{children}</ContextWindowSizeContext.Provider>;
};
