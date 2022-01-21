import capitalize from 'lodash-es/capitalize';
import { registerBreadcrumbs, defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schemas/openmrs-esm-patient-chart-schema';
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
        load: getSyncLifecycle(createDashboardLink(summaryDashboardMeta), {
          featureName: 'summary-dashboard',
          moduleName,
        }),
        meta: summaryDashboardMeta,
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
        id: 'encounters-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 5,
        load: getSyncLifecycle(createDashboardLink(encountersDashboardMeta), { featureName: 'encounter', moduleName }),
        meta: encountersDashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'past-visits-detail-overview',
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
      ,
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
          title: 'Start a visit',
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
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
