import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './test-results/dashboard.meta';

const moduleName = '@openmrs/esm-patient-labs-app';

const options = {
  featureName: 'patient-labs',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const externalOverview = getAsyncLifecycle(() => import('./test-results/overview/external-overview.extension'), options);
export const resultsViewer = getAsyncLifecycle(() => import('./test-results/results-viewer'), options);
export const printModal = getAsyncLifecycle(() => import('./test-results/print-modal/print-modal.extension'), options);

export const testResultsDashboardLink =
  // t('Test Results', 'Test Results')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const labOrderPanel = getAsyncLifecycle(
  () => import('./lab-orders/lab-order-basket-panel/lab-order-basket-panel.extension'),
  options,
);

registerWorkspace({
  name: 'add-lab-order',
  type: 'order',
  title: 'Add lab order',
  load: getAsyncLifecycle(() => import('./lab-orders/add-lab-order/add-lab-order.workspace'), options),
});
