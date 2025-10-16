import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-vitals-biometrics-dashboard-slot',
  path: 'Vitals & Biometrics',
  title: 'Vitals & Biometrics',
  icon: 'omrs-icon-activity',
};
