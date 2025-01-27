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

export const externalOverview = getAsyncLifecycle(
  () => import('./test-results/overview/external-overview.extension'),
  options,
);
export const resultsViewer = getAsyncLifecycle(() => import('./test-results/results-viewer'), options);
export const printModal = getAsyncLifecycle(() => import('./test-results/print-modal/print-modal.extension'), options);

export const testResultsDashboardLink =
  // t('Results', 'Results')
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
