import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import medicationsSummaryComponent from './medications-summary/medications-summary.component';
import activeMedicationsComponent from './active-medications/active-medications.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-medications-app';

const options = {
  featureName: 'patient-medications',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const medicationsSummary = getSyncLifecycle(medicationsSummaryComponent, options);

export const activeMedications = getSyncLifecycle(activeMedicationsComponent, options);

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
  // t('addDrugOrderWorkspaceTitle', 'Add drug order')
  title: translateFrom(moduleName, 'addDrugOrderWorkspaceTitle', 'Add drug order'),
  load: getAsyncLifecycle(() => import('./add-drug-order/add-drug-order.workspace'), options),
});
