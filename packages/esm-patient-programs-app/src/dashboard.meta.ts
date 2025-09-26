import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-programs-dashboard-slot',
  path: 'Programs',
  title: 'Programs',
  icon: 'omrs-icon-programs',
};
