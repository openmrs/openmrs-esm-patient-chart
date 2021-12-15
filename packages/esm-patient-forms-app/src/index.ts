import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';
import OfflineToolsNavLink from './offline-forms/offline-tools-nav-link.component';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-forms-app';

  const options = {
    featureName: 'patient-forms',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/offline-tools/forms`,
      title: 'Offline forms',
      parent: `${window.spaBase}/offline-tools`,
    },
  ]);

  return {
    extensions: [
      {
        id: 'patient-form-entry-workspace',
        load: getAsyncLifecycle(() => import('./forms/form-entry.component'), options),
        meta: {
          title: 'Form Entry',
        },
        online: true,
        offline: true,
      },
      {
        id: 'forms-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 5,
        load: getAsyncLifecycle(() => import('./forms/forms-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: {
          isOffline: false,
        },
        offline: {
          isOffline: true,
        },
      },
      {
        id: 'patient-form-dashboard',
        order: 0,
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./forms/forms-detailed-overview.component'), options),
        online: {
          isOffline: false,
        },
        offline: {
          isOffline: true,
        },
      },
      {
        id: 'forms-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 12,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'offline-tools-dashboard-forms-card',
        slot: 'offline-tools-dashboard-cards',
        load: getAsyncLifecycle(() => import('./offline-forms/offline-forms-overview-card.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'offline-tools-page-forms-link',
        slot: 'offline-tools-page-slot',
        load: getSyncLifecycle(() => OfflineToolsNavLink({ page: 'forms', title: 'Offline forms' }), options),
        meta: {
          name: 'forms',
          slot: 'offline-tools-page-forms-slot',
        },
        online: true,
        offline: true,
      },
      {
        id: 'offline-tools-page-forms',
        slot: 'offline-tools-page-forms-slot',
        load: getAsyncLifecycle(() => import('./offline-forms/offline-forms.component'), options),
        online: {
          canMarkFormsAsOffline: true,
        },
        offline: {
          canMarkFormsAsOffline: false,
        },
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
