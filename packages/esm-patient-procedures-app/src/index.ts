import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import immunizationsOverviewComponent from '@openmrs/esm-patient-immunizations-app/src/immunizations/immunizations-overview.component';
import immunizationsDetailedSummaryComponent from '@openmrs/esm-patient-immunizations-app/src/immunizations/immunizations-detailed-summary.component';
import immunizationHistorySummaryComponent from '@openmrs/esm-patient-immunizations-app/src/immunizations/immunization-history-dashboard.component';

const moduleName = '@openmrs/esm-patient-procedures-app';

const options = {
  featureName: 'patient-procedures',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const proceduresOverview = getSyncLifecycle(immunizationsOverviewComponent, options);

export const proceduresDetailedSummary = getSyncLifecycle(immunizationsDetailedSummaryComponent, options);

export const procedureHistorySummary = getSyncLifecycle(immunizationHistorySummaryComponent, options);

export const proceduresDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
  }),
  options,
);
