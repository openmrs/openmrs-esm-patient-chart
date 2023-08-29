import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
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

export const drugOrderPanel = getAsyncLifecycle(
  () => import('./drug-order-basket-panel/drug-order-basket-panel.extension'),
  options,
);

export const medicationsDashboardLink =
  // t('Medications', 'Medications')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

registerWorkspace({
  name: 'add-drug-order',
  type: 'order',
  title: 'Add drug order',
  load: getAsyncLifecycle(() => import('./add-drug-order/add-drug-order.workspace'), options),
});
