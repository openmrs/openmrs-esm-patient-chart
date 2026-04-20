import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-allergies-dashboard-slot',
  path: 'Allergies',
  title: 'Allergies',
  icon: 'omrs-icon-warning',
};
