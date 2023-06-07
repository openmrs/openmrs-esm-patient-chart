import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-programs-app';

  const options = {
    featureName: 'patient-programs',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'programs-overview-widget',
        order: getPatientSummaryOrder('Programs'),
        load: getAsyncLifecycle(() => import('./programs/programs-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'programs-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./programs/programs-detailed-summary.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        name: 'programs-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 10,
        // t('Programs_link', 'Programs')
        load: getSyncLifecycle(
          createDashboardLink({
            ...dashboardMeta,
            title: () =>
              Promise.resolve(
                window.i18next?.t('Programs_link', { defaultValue: 'Programs', ns: moduleName }) ?? 'Programs',
              ),
          }),
          options,
        ),
        meta: dashboardMeta,
      },
      {
        name: 'programs-form-workspace',
        load: getAsyncLifecycle(() => import('./programs/programs-form.component'), options),
        meta: {
          title: 'Record program enrollment',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
