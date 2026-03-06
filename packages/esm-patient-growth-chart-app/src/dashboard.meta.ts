import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-growth-dashboard-slot',
  path: 'Growth Chart',
  title: 'Growth Chart',
  icon: 'omrs-icon-activity',
};
