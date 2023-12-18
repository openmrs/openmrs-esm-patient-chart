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
import externalOverviewComponent from './test-results/overview/external-overview.extension';
import resultsViewerComponent from './test-results/results-viewer';

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

export const externalOverview = getSyncLifecycle(externalOverviewComponent, options);
export const resultsViewer = getSyncLifecycle(resultsViewerComponent, options);
export const printModal = getAsyncLifecycle(() => import('./test-results/print-modal/print-modal.extension'), options);

export const testResultsDashboardLink =
  // t('Results Viewer', 'Results Viewer')
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
