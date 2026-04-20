import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string; columns: number; hideDashboardTitle: boolean } = {
  slot: 'patient-chart-test-results-dashboard-slot',
  columns: 1,
  path: 'Results',
  title: 'Results',
  icon: 'omrs-icon-chart-average',
  hideDashboardTitle: true,
};
