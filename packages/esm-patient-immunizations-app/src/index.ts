import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import immunizationsOverviewComponent from './immunizations/immunizations-overview.component';
import immunizationsDetailedSummaryComponent from './immunizations/immunizations-detailed-summary.component';

const moduleName = '@openmrs/esm-patient-immunizations-app';

const options = {
  featureName: 'patient-immunizations',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const immunizationsOverview = getSyncLifecycle(immunizationsOverviewComponent, options);

export const immunizationsDetailedSummary = getSyncLifecycle(immunizationsDetailedSummaryComponent, options);

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
registerWorkspace({
  name: 'immunization-form-workspace',
  load: getAsyncLifecycle(() => import('./immunizations/immunizations-form.component'), options),
  title: translateFrom(moduleName, 'immunizationWorkspaceTitle', 'Immunization Form'),
});
