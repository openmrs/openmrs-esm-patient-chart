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
  fhir2: '^1.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-conditions-app';

  const options = {
    featureName: 'patient-conditions',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'conditions-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: getPatientSummaryOrder('Conditions'),
        load: getAsyncLifecycle(() => import('./conditions/conditions-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'conditions-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./conditions/conditions-detailed-summary.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'conditions-widget',
        load: getAsyncLifecycle(() => import('./conditions/conditions-widget.component'), options),
        meta: {},
      },
      {
        name: 'conditions-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 7,
        // t('conditions_link', 'Conditions')
        load: getSyncLifecycle(
          createDashboardLink({
            ...dashboardMeta,
            title: () =>
              Promise.resolve(
                window.i18next?.t('conditions_link', { defaultValue: 'Conditions', ns: moduleName }) ?? 'Conditions',
              ),
          }),
          options,
        ),
        meta: dashboardMeta,
      },
      {
        name: 'conditions-form-workspace',
        load: getAsyncLifecycle(() => import('./conditions/conditions-form.component'), options),
      },
      {
        name: 'condition-delete-confirmation-dialog',
        load: getAsyncLifecycle(() => import('./conditions/delete-condition-modal.component'), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
