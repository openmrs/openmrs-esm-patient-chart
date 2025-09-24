import { type DashboardConfig } from '@openmrs/esm-patient-common-lib';

export const summaryDashboardMeta: DashboardConfig = {
  slot: 'patient-chart-summary-dashboard-slot',
  path: 'Patient Summary',
  title: 'Patient Summary',
  icon: 'omrs-icon-report',
};

export const encountersDashboardMeta: DashboardConfig = {
  slot: 'patient-chart-encounters-dashboard-slot',
  path: 'Visits',
  title: 'Visits',
  icon: 'omrs-icon-calendar-heat-map',
};
