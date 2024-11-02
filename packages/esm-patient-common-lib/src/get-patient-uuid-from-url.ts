import { getPatientUuidFromStore } from './store/patient-chart-store';

/**
 * @deprecated This function is now replaced with `getPatientUuidFromStore`. This function will be removed in upcoming releases.
 * @returns {string} patientUuid
 */
export function getPatientUuidFromUrl(): string {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  const patientUuidFromUrl = match && match[1];
  return patientUuidFromUrl || getPatientUuidFromStore();
}
