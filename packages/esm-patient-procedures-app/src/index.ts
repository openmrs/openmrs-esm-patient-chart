import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-procedures-app';

const options = {
  featureName: 'patient-procedures',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const proceduresDetailedSummary = getAsyncLifecycle(
  () => import('./components/procedures-history/procedures-history.component'),
  options,
);

// t('procedures', 'Procedures')
export const proceduresDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
  }),
  options,
);
