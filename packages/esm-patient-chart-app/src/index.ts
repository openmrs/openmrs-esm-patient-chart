import { registerBreadcrumbs, defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { capitalize } from 'lodash-es';
import { esmPatientChartSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';
import { setupCacheableRoutes, setupOfflineVisitsSync } from './offline';
import { summaryDashboardMeta, encountersDashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {};

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
      path: `${spaBasePath}/:view`,
      title: ([_, key]) => `${capitalize(key).replace(/_/g, ' ')} dashboard`,
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
        name: 'charts-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 0,
        load: getSyncLifecycle(createDashboardLink(summaryDashboardMeta), {
          featureName: 'summary-dashboard',
          moduleName,
        }),
        meta: summaryDashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'start-visit-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/start-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'stop-visit-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/stop-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'cancel-visit-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/cancel-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'add-past-visit-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'encounters-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 5,
        load: getSyncLifecycle(createDashboardLink(encountersDashboardMeta), { featureName: 'encounter', moduleName }),
        meta: encountersDashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'past-visits-detail-overview',
        order: 1,
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
        name: 'past-visits-overview',
        load: getAsyncLifecycle(() => import('./visit/past-visit-overview.component'), {
          featureName: 'past-visits-overview',
          moduleName,
        }),
        meta: {
          title: 'Edit or load a past visit',
          view: 'visits',
        },
      },
      {
        name: 'start-visit-workspace-form',
        load: getAsyncLifecycle(() => import('./visit/visit-form/visit-form.component'), {
          featureName: 'start-visit-form',
          moduleName,
        }),
        meta: {
          title: 'Start a visit',
        },
      },
      {
        name: 'patient-details-tile',
        slot: 'visit-form-header-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./patient-details-tile/patient-details-tile.component'), {
          featureName: 'patient-details-tile',
          moduleName,
        }),
      },
      {
        name: 'nav-group',
        load: getAsyncLifecycle(() => import('./side-nav/generic-nav-group.component'), {
          featureName: 'Nav group',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
