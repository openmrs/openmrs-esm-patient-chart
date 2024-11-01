import { createGlobalStore, useStore } from '@openmrs/esm-framework';

export interface PatientChartStore {
  patientUuid: string;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {
  patientUuid: '',
});

/**
 * This function returns the patient chart store.
 *
 * The patient chart store is used to store all global variables used in the patient chart.
 * In the recent requirements, patient chart is now not only bound with `/patient/{patientUuid}/` path.
 */
export function getPatientChartStore() {
  return patientChartStore;
}

export function usePatientChartStore() {
  return useStore(patientChartStore);
}

/**
 * This function will get the patient UUID from either URL, or will look into the patient chart store.
 * @returns {string} patientUuid
 */
export function getPatientUuidFromUrlOrStore() {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  const patientUuidFromUrl = match && match[1];
  return patientUuidFromUrl || patientChartStore.getState().patientUuid;
}
