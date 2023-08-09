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

export const medicationsSummary = getAsyncLifecycle(() => import('./medications-summary/root-medication-summary'), options);

export const activeMedications = getAsyncLifecycle(() => import('./active-medications/active-medications.component'), options);

export const orderBasketWorkspace = getAsyncLifecycle(() => import('./order-basket/root-order-basket'), options);

export const medicationsDashboardLink =
  // t('Medications', 'Medications')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const orderBasketActionMenu = getAsyncLifecycle(
  () => import('./medications-summary/order-basket-action-button.component'),
  options,
);
