import { ExtensionInfo, extensionStore } from '@openmrs/esm-framework';
import { ScreenModeTypes } from '..';

export function getDefaultScreenMode(ext: ExtensionInfo): ScreenModeTypes {
  const screenMode: ScreenModeTypes = ext.meta?.screenSize;

  if (typeof screenMode === 'string') {
    return screenMode;
  }
  return ScreenModeTypes.minimize;
}

export const getWorkspaceScreenMode = (extensions) => {
  if (extensions.length === 0) {
    return ScreenModeTypes.normal;
  } else if (extensions.length === 1) {
    const state = extensionStore.getState();
    return getDefaultScreenMode(state.extensions[extensions[0]]);
  }
};
