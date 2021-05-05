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
