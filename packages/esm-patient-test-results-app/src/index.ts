import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-test-results-app';

const options = {
  featureName: 'patient-test-results',
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

export const externalOverview = getAsyncLifecycle(() => import('./overview/external-overview.component'), options);

export const resultsViewer = getAsyncLifecycle(() => import('./results-viewer'), options);
export const printModal = getAsyncLifecycle(() => import('./print-modal/print-modal.component'), options);

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
