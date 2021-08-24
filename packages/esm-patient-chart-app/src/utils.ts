import { ExtensionInfo, LayoutType, translateFrom } from '@openmrs/esm-framework';

export function isDesktop(layout: LayoutType) {
  return layout === 'desktop';
}

export function getTitle(ext: ExtensionInfo) {
  const title = ext.meta?.title;

  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }

  return ext.name;
}

export function checkScreenMode(ext: ExtensionInfo) {
  const screenMode = ext.meta?.screenSize;

  if (typeof screenMode === 'string') {
    return screenMode;
  } else if (screenMode && typeof screenMode === 'object') {
    return translateFrom(ext.moduleName, screenMode.key, screenMode.default);
  }

  return 'minimize';
}
