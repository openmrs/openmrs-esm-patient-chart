import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import proceduresDetailedSummaryComponent from './components/procedures-history/procedures-history.component';

const moduleName = '@openmrs/esm-patient-procedures-app';

const options = {
  featureName: 'patient-procedures',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const proceduresDetailedSummary = getSyncLifecycle(proceduresDetailedSummaryComponent, options);

export const proceduresDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
  }),
  options,
);
