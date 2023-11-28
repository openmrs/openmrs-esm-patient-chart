import { isDesktop as checkIfIsDesktop, type LayoutType } from '@openmrs/esm-framework';

export function isDesktop(layout: LayoutType) {
  return checkIfIsDesktop(layout);
}
