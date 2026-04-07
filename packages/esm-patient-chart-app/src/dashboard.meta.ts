import { type DashboardLinkConfig } from '@openmrs/esm-patient-common-lib';

export const summaryDashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-summary-dashboard-slot',
  path: 'Patient Summary',
  title: 'Patient Summary',
  icon: 'omrs-icon-report',
};

export const encountersDashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-encounters-dashboard-slot',
  path: 'Visits',
  title: 'Visits',
  icon: 'omrs-icon-calendar-heat-map',
};
