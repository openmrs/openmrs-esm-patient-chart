import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-growth-dashboard-slot',
  path: 'growth-chart',
  title: 'Growth chart',
  icon: 'omrs-icon-chart-line',
};
