import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  subscribePrecacheStaticDependencies,
  syncAllDynamicOfflineData,
  translateFrom,
} from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
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

  // t('clinicalForm', 'Clinical Form')
  registerWorkspace({
    name: 'patient-form-entry-workspace',
    title: translateFrom(moduleName, 'clinicalForm', 'Clinical Form'),
    load: getAsyncLifecycle(() => import('./forms/form-entry.component'), options),
    canMaximize: true,
    canHide: true,
    width: 'wider',
    type: 'clinical-form',
  });

  // t('clinicalForms', 'Clinical Forms')
  registerWorkspace({
    name: 'clinical-forms-workspace',
    title: translateFrom(moduleName, 'clinicalForms', 'Clinical Forms'),
    load: getAsyncLifecycle(() => import('./forms/forms-workspace.component'), options),
    type: 'clinical-form',
    width: 'wider',
  });
}

export const clinicalFormActionMenu = getSyncLifecycle(clinicalFormActionMenuComponent, options);

export const offlineFormOverviewCard = getSyncLifecycle(offlineFormOverviewCardComponent, options);

export const offlineFormsNavLink = getSyncLifecycle(
  () => OfflineToolsNavLink({ page: 'forms', title: 'Offline forms' }),
  options,
);

export const offlineForms = getSyncLifecycle(offlineFormsComponent, options);
