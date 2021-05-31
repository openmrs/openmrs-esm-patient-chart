import capitalize from 'lodash-es/capitalize';
import {
  registerBreadcrumbs,
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schemas/openmrs-esm-patient-chart-schema';
import { moduleName, spaBasePath } from './constants';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const dashboardMeta = {
  name: 'summary',
  slot: 'patient-chart-summary-dashboard-slot',
  config: { columns: 4, type: 'grid' },
  title: 'Summary',
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/openmrs/ws/fhir2/R4/Patient/.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/visit.+',
  });

  defineConfigSchema(moduleName, esmPatientChartSchema);

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:view/:subview?`,
      title: ([_, key]) => `${capitalize(key)} Dashboard`,
      parent: spaBasePath,
    },
  ]);

  return {
    pages: [
      {
        route: /^patient\/.+\/chart/,
        load: getAsyncLifecycle(() => import('./root.component'), {
          featureName: 'patient-chart',
          moduleName,
        }),
        online: true,
        offline: true,
      },
    ],
    extensions: [
      {
        id: 'charts-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), {
          featureName: 'summary-dashboard',
          moduleName,
        }),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'patient-chart-nav-items',
        load: getAsyncLifecycle(() => import('./ui-components/nav.component'), {
          featureName: 'nav-items',
          moduleName,
        }),
        online: true,
        offline: true,
      },
      {
        id: 'start-visit-patient-actions-slot',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/start-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        id: 'stop-visit-patient-actions-slot',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/stop-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        id: 'notification-buttons',
        slot: 'action-menu-items-slot',
        load: getAsyncLifecycle(() => import('./ui-components/notifications-button.component'), {
          featureName: 'notification-buttons',
          moduleName,
        }),
      },
      {
        id: 'add-past-visit-patient-actions-slot',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        id: 'past-visits-detail-overview',
        slot: 'patient-chart-encounters-dashboard-slot',
        load: getAsyncLifecycle(() => import('./visit/visits-widget/visit-detail-overview.component'), {
          featureName: 'visits-detail-slot',
          moduleName,
        }),
        meta: {
          title: 'Visits',
          view: 'Visits',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
