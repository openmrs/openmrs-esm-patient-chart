import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-audit-history-dashboard-slot',
  path: 'audit-history',
  title: 'Audit History',
  icon: 'omrs-icon-report',
};
