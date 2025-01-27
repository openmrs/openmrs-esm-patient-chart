import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-immunizations-app';

const options = {
  featureName: 'patient-immunizations',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const immunizationsOverview = getAsyncLifecycle(
  () => import('./immunizations/immunizations-overview.component'),
  options,
);

export const immunizationsDetailedSummary = getAsyncLifecycle(
  () => import('./immunizations/immunizations-detailed-summary.component'),
  options,
);

export const immunizationsDashboardLink =
  // t('Immunizations', 'Immunizations')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

// t('immunizationWorkspaceTitle', 'Immunization Form')
export const immunizationFormWorkspace = getAsyncLifecycle(
  () => import('./immunizations/immunizations-form.workspace'),
  options,
);
