import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-attachments-dashboard-slot',
  path: 'attachments',
  title: 'Attachments',
  icon: 'omrs-icon-document-attachment',
};
