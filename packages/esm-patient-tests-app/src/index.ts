import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './test-results/dashboard.meta';
import externalOverviewComponent from './test-results/overview/external-overview.extension';
import resultsViewerComponent from './test-results/results-viewer';
import { moduleName } from './constants';

const options = {
  featureName: 'patient-tests',
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
  () => import('./test-orders/lab-order-basket-panel/lab-order-basket-panel.extension'),
  options,
);

// t('addLabOrderWorkspaceTitle', 'Add lab order')
export const addLabOrderWorkspace = getAsyncLifecycle(
  () => import('./test-orders/add-test-order/add-test-order.workspace'),
  options,
);

export const timelineResultsModal = getAsyncLifecycle(
  () => import('./test-results/panel-timeline/timeline-results.modal'),
  {
    featureName: 'Timeline results',
    moduleName,
  },
);
