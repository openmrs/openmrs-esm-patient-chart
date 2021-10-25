import { ExtensionInfo, LayoutType, translateFrom } from '@openmrs/esm-framework';
import { ScreenModeTypes } from './types';

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

export function checkScreenMode(ext: ExtensionInfo): ScreenModeTypes {
  const screenMode: ScreenModeTypes = ext.meta?.screenSize;

  if (typeof screenMode === 'string') {
    return screenMode;
  }
  return ScreenModeTypes.minimize;
}
