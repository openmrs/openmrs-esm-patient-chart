import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-medications-app';

const options = {
  featureName: 'patient-medications',
  moduleName,
};

export const medicationsSummary = () =>
  getAsyncLifecycle(() => import('./medications/root-medication-summary'), options);

export const activeMedications = () =>
  getAsyncLifecycle(() => import('./medications/active-medications.component'), options);

export const orderBasketWorkspace = () => getAsyncLifecycle(() => import('./medications/root-order-basket'), options);

export const medicationsDashboardLink = () =>
  // t('medications_link', 'Medications')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      title: () =>
        Promise.resolve(
          window.i18next?.t('medications_link', { defaultValue: 'Medications', ns: moduleName }) ?? 'Medications',
        ),
    }),
    options,
  );

export const orderBasketActionMenu = () =>
  getAsyncLifecycle(() => import('./medications-summary/order-basket-action-button.component'), options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
