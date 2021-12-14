import { ExtensionInfo, LayoutType, translateFrom } from '@openmrs/esm-framework';
import { WorkspaceWindowState } from './types';

export function isDesktop(layout: LayoutType) {
  return layout === 'desktop';
}

export function getTitle(ext: ExtensionInfo) {
  const title = ext?.meta?.title;

  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }

  return ext.name;
}

export function determineWindowState(ext: ExtensionInfo): WorkspaceWindowState {
  const screenMode: WorkspaceWindowState = ext.meta?.screenSize;

  if (typeof screenMode === 'string') {
    return screenMode;
  }

  return WorkspaceWindowState.minimized;
}
