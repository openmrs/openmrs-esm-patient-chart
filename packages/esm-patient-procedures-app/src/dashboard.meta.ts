import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-procedures-dashboard-slot',
  path: 'Procedures',
  title: 'Procedures',
  icon: 'omrs-icon-procedure-order',
};
