import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-vitals-biometrics-dashboard-slot',
  path: 'vitals-and-biometrics',
  title: 'Vitals & Biometrics',
  icon: 'omrs-icon-activity',
};
