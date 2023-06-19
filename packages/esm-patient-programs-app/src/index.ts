import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-programs-app';

const options = {
  featureName: 'patient-programs',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const programsOverview = () =>
  getAsyncLifecycle(() => import('./programs/programs-overview.component'), options);

export const programsDetailedSummary = () =>
  getAsyncLifecycle(() => import('./programs/programs-detailed-summary.component'), options);

export const programsDashboardLink = () =>
  // t('programs_link', 'Programs')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      title: () =>
        Promise.resolve(window.i18next?.t('programs_link', { defaultValue: 'Programs', ns: moduleName }) ?? 'Programs'),
    }),
    options,
  );

export const programsForm = () => getAsyncLifecycle(() => import('./programs/programs-form.component'), options);
