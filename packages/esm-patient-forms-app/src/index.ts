import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  subscribePrecacheStaticDependencies,
  syncAllDynamicOfflineData,
} from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { setupDynamicFormDataHandler, setupPatientFormSync } from './offline';
import OfflineToolsNavLink from './offline-forms/offline-tools-nav-link.component';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-forms-app';
  const options = {
    featureName: 'patient-forms',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/offline-tools/forms`,
      title: 'Offline forms',
      parent: `${window.spaBase}/offline-tools`,
    },
  ]);

  setupPatientFormSync();
  setupDynamicFormDataHandler();
  subscribePrecacheStaticDependencies(() => syncAllDynamicOfflineData('form'));

  registerWorkspace({
    name: 'patient-form-entry-workspace',
    title: 'Clinical Form',
    load: getAsyncLifecycle(() => import('./forms/form-entry.component'), options),
  });

  return {
    extensions: [
      {
        name: 'patient-form-dashboard',
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
        name: 'forms-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 12,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'offline-tools-dashboard-forms-card',
        slot: 'offline-tools-dashboard-cards',
        load: getAsyncLifecycle(() => import('./offline-forms/offline-forms-overview-card.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'offline-tools-page-forms-link',
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
        name: 'offline-tools-page-forms',
        slot: 'offline-tools-page-forms-slot',
        load: getAsyncLifecycle(() => import('./offline-forms/offline-forms.component'), options),
        online: {
          canMarkFormsAsOffline: true,
        },
        offline: {
          canMarkFormsAsOffline: false,
        },
      },
      {
        name: 'clinical-form-action-menu',
        slot: 'action-menu-chart-items-slot',
        load: getAsyncLifecycle(() => import('./clinical-form-action-button.component'), options),
        order: 2,
      },
      {
        name: 'clinical-forms-workspace',
        load: getAsyncLifecycle(() => import('./forms/forms-workspace.component'), options),
        meta: {
          title: {
            key: 'clinicalForm',
            default: 'Clinical form',
          },
          type: 'order',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
