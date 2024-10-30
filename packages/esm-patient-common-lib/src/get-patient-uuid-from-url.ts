import { getPatientChartStore } from './store/patient-chart-store';

export function getPatientUuidFromUrl(): string {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  const patientUuidFromUrl = match && match[1];
  return patientUuidFromUrl || getPatientChartStore().getState().patientUuid;
}
