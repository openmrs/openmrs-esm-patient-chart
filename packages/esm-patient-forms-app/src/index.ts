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
import clinicalFormActionMenuComponent from './clinical-form-action-button.component';
import offlineFormOverviewCardComponent from './offline-forms/offline-forms-overview-card.component';
import offlineFormsComponent from './offline-forms/offline-forms.component';

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

// t('clinicalForms', 'Clinical forms')
export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-dashboard.workspace'), options);

export const clinicalFormActionMenu = getSyncLifecycle(clinicalFormActionMenuComponent, options);

export const offlineFormOverviewCard = getSyncLifecycle(offlineFormOverviewCardComponent, options);

export const offlineFormsNavLink = getSyncLifecycle(
  () => OfflineToolsNavLink({ page: 'forms', title: 'Offline forms' }),
  options,
);

export const offlineForms = getSyncLifecycle(offlineFormsComponent, options);
