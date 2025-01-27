import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  subscribePrecacheStaticDependencies,
  syncAllDynamicOfflineData,
} from '@openmrs/esm-framework';
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

  setupPatientFormSync();
  setupDynamicFormDataHandler();
  subscribePrecacheStaticDependencies(() => syncAllDynamicOfflineData('form'));
}

// t('clinicalForm', 'Clinical form')
export const patientFormEntryWorkspace = getAsyncLifecycle(() => import('./forms/form-entry.workspace'), options);

export const patientHtmlFormEntryWorkspace = getAsyncLifecycle(
  () => import('./htmlformentry/html-form-entry.workspace'),
  options,
);

// t('clinicalForms', 'Clinical forms')
export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-dashboard.workspace'), options);
export const clinicalFormsWorkspaceExtension = getAsyncLifecycle(
  () => import('./forms/forms-dashboard.workspace'),
  options,
);

export const clinicalFormActionMenu = getAsyncLifecycle(
  () => import('./clinical-form-action-button.component'),
  options,
);

export const offlineFormOverviewCard = getAsyncLifecycle(
  () => import('./offline-forms/offline-forms-overview-card.component'),
  options,
);

export const offlineFormsNavLink = getSyncLifecycle(
  () => OfflineToolsNavLink({ page: 'forms', title: 'Offline forms' }),
  options,
);

export const offlineForms = getAsyncLifecycle(() => import('./offline-forms/offline-forms.component'), options);
