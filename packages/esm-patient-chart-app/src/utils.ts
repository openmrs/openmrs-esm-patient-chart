import { isDesktop as checkIfIsDesktop, LayoutType } from '@openmrs/esm-framework';

export function isDesktop(layout: LayoutType) {
  return checkIfIsDesktop(layout);
}

export function generateVisitQueueNumber(service, maxVisitNumber) {
  const servicePrefix = service?.toUpperCase().substring(0, 3);
  const visitNumber = (maxVisitNumber + 1)?.toString().padStart(4, '0');
  return servicePrefix + '-' + visitNumber;
}
