import { createGlobalStore, useStore, type VisitReturnType } from '@openmrs/esm-framework';

export interface PatientChartStore {
  patientUuid?: string;
  patient?: fhir.Patient;
  visits?: VisitReturnType;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {});

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
export function getPatientUuidFromStore(): string | undefined {
  return patientChartStore.getState().patientUuid;
}

/**
 * This function will get the current patient from the store
 * @returns {string} patientUuid
 */
export function getPatientFromStore(): fhir.Patient | undefined {
  return patientChartStore.getState().patient;
}
