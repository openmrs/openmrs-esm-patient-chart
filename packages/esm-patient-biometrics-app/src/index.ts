import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
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
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+/ws/rest/v1/concept.+`,
  });

  const moduleName = '@openmrs/esm-patient-biometrics-app';

  const options = {
    featureName: 'patient-biometrics',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'biometrics-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: getPatientSummaryOrder('Biometrics'),
        load: getAsyncLifecycle(() => import('./biometrics/biometrics-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddBiometrics: true },
        offline: { showAddBiometrics: false },
      },
      {
        name: 'results-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 2,
        // t('Biometrics_link', 'Vitals & Biometrics')
        load: getSyncLifecycle(
          createDashboardLink({
            ...dashboardMeta,
            title: () =>
              Promise.resolve(
                window.i18next?.t('Biometrics_link', { defaultValue: 'Vitals & Biometrics', ns: moduleName }) ??
                  'Vitals & Biometrics',
              ),
          }),
          options,
        ),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'biometrics-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./biometrics/biometrics-main.component'), options),
        meta: {
          view: 'biometrics',
          title: 'Biometrics',
        },
        online: { showAddBiometrics: true },
        offline: { showAddBiometrics: false },
      },
      {
        name: 'weight-tile',
        order: 2,
        slot: 'visit-form-header-slot',
        load: getAsyncLifecycle(() => import('./biometrics/weight-tile.component'), options),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
