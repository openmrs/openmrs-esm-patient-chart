import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-medications-app';

const options = {
  featureName: 'patient-medications',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const medicationsSummary = getAsyncLifecycle(
  () => import('./medications-summary/medications-summary.component'),
  options,
);

export const activeMedications = getAsyncLifecycle(
  () => import('./active-medications/active-medications.component'),
  options,
);

export const drugOrderPanel = getAsyncLifecycle(() => import('./drug-order-panel/drug-order-panel.component'), options);

export const medicationsDashboardLink =
  // t('Medications', 'Medications')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );
