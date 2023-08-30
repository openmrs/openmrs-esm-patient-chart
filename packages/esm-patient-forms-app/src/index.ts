import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  subscribePrecacheStaticDependencies,
  syncAllDynamicOfflineData,
} from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { setupDynamicFormDataHandler, setupPatientFormSync } from './offline';
import OfflineToolsNavLink from './offline-forms/offline-tools-nav-link.component';

const moduleName = '@openmrs/esm-patient-forms-app';

const options = {
  featureName: 'patient-forms',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
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
    canMaximize: true,
    canHide: true,
    width: 'wider',
    type: 'clinical-form',
  });
}

export const offlineFormOverviewCard = getAsyncLifecycle(
  () => import('./offline-forms/offline-forms-overview-card.component'),
  options,
);

export const offlineFormsNavLink = getSyncLifecycle(
  () => OfflineToolsNavLink({ page: 'forms', title: 'Offline forms' }),
  options,
);

export const offlineForms = getAsyncLifecycle(() => import('./offline-forms/offline-forms.component'), options);

export const clinicalFormActionMenu = getAsyncLifecycle(
  () => import('./clinical-form-action-button.component'),
  options,
);

export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-workspace.component'), options);
