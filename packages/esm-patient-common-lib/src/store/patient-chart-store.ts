import { createGlobalStore, useStore } from '@openmrs/esm-framework';

export interface PatientChartStore {
  patientUuid: string;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {
  patientUuid: '',
});

export function getPatientChartStore() {
  return patientChartStore;
}

export function usePatientChartStore() {
  return useStore(patientChartStore);
}
