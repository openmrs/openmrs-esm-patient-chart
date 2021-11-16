import capitalize from 'lodash-es/capitalize';
import { registerBreadcrumbs, defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schemas/openmrs-esm-patient-chart-schema';
import { moduleName, spaBasePath } from './constants';
import { setupCacheableRoutes, setupOfflineVisitsSync } from './offline';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

const dashboardMeta = {
  name: 'summary',
  slot: 'patient-chart-summary-dashboard-slot',
  config: { columns: 4, type: 'grid' },
  title: 'Patient Summary',
};

function setupOpenMRS() {
  setupOfflineVisitsSync();
  setupCacheableRoutes();

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
        order: 0,
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
          view: 'visits',
        },
      },
      {
        id: 'past-visits-overview',
        load: getAsyncLifecycle(() => import('./visit/past-visit-overview.component'), {
          featureName: 'past-visits-overview',
          moduleName,
        }),
        meta: {
          title: 'Past Visits',
          view: 'visits',
        },
      },
      {
        id: 'start-visit-workspace-form',
        load: getAsyncLifecycle(() => import('./visit/visit-form/visit-form.component'), {
          featureName: 'start-visit-form',
          moduleName,
        }),
        meta: {
          title: 'Start Visit Form',
        },
      },
      {
        id: 'patient-details-tile',
        slot: 'visit-form-header-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./ui-components/patient-details-tile.component'), {
          featureName: 'patient-details-tile',
          moduleName,
        }),
      },
      {
        id: 'form-button',
        slot: 'action-menu-items-slot',
        order: 2,
        load: getAsyncLifecycle(() => import('./ui-components/forms-button.component'), {
          featureName: 'form-button',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
