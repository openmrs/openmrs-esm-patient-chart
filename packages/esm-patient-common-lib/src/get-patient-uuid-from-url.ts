import { getPatientUuidFromUrlOrStore } from './store/patient-chart-store';

/**
 * @deprecated This function is now replaced with `getPatientUuidFromUrlOrStore`. This function will be removed in upcoming releases.
 * @returns {string} patientUuid
 */
export const getPatientUuidFromUrl = getPatientUuidFromUrlOrStore;
