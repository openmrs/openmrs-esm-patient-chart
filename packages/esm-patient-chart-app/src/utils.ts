import { isDesktop as checkIfIsDesktop, LayoutType } from '@openmrs/esm-framework';

export function isDesktop(layout: LayoutType) {
  return checkIfIsDesktop(layout);
}
