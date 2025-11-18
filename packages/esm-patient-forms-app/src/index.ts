import {
  defineConfigSchema,
  getAsyncLifecycle,
  subscribePrecacheStaticDependencies,
  syncAllDynamicOfflineData,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { setupDynamicFormDataHandler, setupPatientFormSync } from './offline';

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

export const patientFormEntryWorkspace = getAsyncLifecycle(() => import('./forms/form-entry.workspace'), options);

export const exportedPatientFormEntryWorkspace = getAsyncLifecycle(
  () => import('./forms/exported-form-entry.workspace'),
  options,
);

export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-dashboard.workspace'), options);

export const exportedClinicalFormsWorkspace = getAsyncLifecycle(
  () => import('./forms/exported-forms-dashboard.workspace'),
  options,
);

export const clinicalFormActionButton = getAsyncLifecycle(
  () => import('./clinical-form-action-button.component'),
  options,
);

export const offlineFormOverviewCard = getAsyncLifecycle(
  () => import('./offline-forms/offline-forms-overview-card.component'),
  options,
);

export const offlineFormsNavLink = getAsyncLifecycle(
  () =>
    import('./offline-forms/offline-tools-nav-link.component').then(
      (mod) => mod.default({ page: 'forms', title: 'Offline forms' }) as any,
    ),
  options,
);

export const offlineForms = getAsyncLifecycle(() => import('./offline-forms/offline-forms.component'), options);
