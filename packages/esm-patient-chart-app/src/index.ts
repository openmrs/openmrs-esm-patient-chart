import {
  registerBreadcrumbs,
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  defineExtensionConfigSchema,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';
import { summaryDashboardMeta, encountersDashboardMeta } from './dashboard.meta';
import { setupOfflineVisitsSync, setupCacheableRoutes } from './offline';
import { genericDashboardConfigSchema } from './side-nav/generic-dashboard.component';
import { genericNavGroupConfigSchema } from './side-nav/generic-nav-group.component';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {};

function setupOpenMRS() {
  setupOfflineVisitsSync();
  setupCacheableRoutes();

  defineConfigSchema(moduleName, esmPatientChartSchema);
  defineExtensionConfigSchema('nav-group', genericNavGroupConfigSchema);
  defineExtensionConfigSchema('dashboard', genericDashboardConfigSchema);

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:view`,
      title: ([_, key]) => `${decodeURIComponent(key)} dashboard`,
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
        name: 'mark-alive-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/mark-patient-alive.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'stop-visit-button-patient-search',
        slot: 'patient-search-actions-slot',
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
        name: 'mark-patient-deceased-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/mark-patient-deceased'), {
          featureName: 'patient-actions-slot-deceased-button',
          moduleName,
        }),
      },
      {
        name: 'cancel-visit-button',
        slot: 'patient-search-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/cancel-visit.component'), {
          featureName: 'patient-actions-slot-cancel-visit-button',
          moduleName,
        }),
      },
      {
        name: 'add-past-visit-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
          featureName: 'patient-actions-slot-add-past-visit-button',
          moduleName,
        }),
      },
      {
        name: 'add-past-visit-button',
        slot: 'patient-search-actions-slot',
        load: getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
          featureName: 'patient-search-actions-slot-add-past-visit-button',
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
        name: 'mark-patient-deceased-workspace-form',
        load: getAsyncLifecycle(() => import('./deceased/deceased-form.component'), {
          featureName: 'mark-patient-deceased-form',
          moduleName,
        }),
        meta: {
          title: 'Mark Deceased',
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
      {
        name: 'dashboard',
        load: getAsyncLifecycle(() => import('./side-nav/generic-dashboard.component'), {
          featureName: 'Dashboard',
          moduleName,
        }),
      },
      {
        name: 'cancel-visit-dialog',
        load: getAsyncLifecycle(() => import('./visit/visit-prompt/cancel-visit-dialog.component'), {
          featureName: 'cancel visit',
          moduleName,
        }),
      },
      {
        name: 'start-visit-dialog',
        load: getAsyncLifecycle(() => import('./visit/visit-prompt/start-visit-dialog.component'), {
          featureName: 'start visit',
          moduleName,
        }),
      },
      {
        id: 'end-visit-dialog',
        load: getAsyncLifecycle(() => import('./visit/visit-prompt/end-visit-dialog.component'), {
          featureName: 'end visit',
          moduleName,
        }),
      },
      {
        name: 'confirm-deceased-dialog',
        load: getAsyncLifecycle(() => import('./deceased/confirmation-dialog.component'), {
          featureName: 'confirm death',
          moduleName,
        }),
      },
      {
        name: 'confirm-alive-modal',
        load: getAsyncLifecycle(() => import('./deceased/mark-alive-modal.component'), {
          featureName: 'confirm alive',
          moduleName,
        }),
      },
      {
        id: 'start-visit-button-patient-search',
        slot: 'start-visit-button-slot',
        load: getAsyncLifecycle(() => import('./visit/start-visit-button.component'), {
          featureName: 'start-visit-button-patient-search',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
