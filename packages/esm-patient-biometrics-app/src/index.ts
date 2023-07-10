import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-biometrics-app';

const options = {
  featureName: 'patient-biometrics',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+/ws/rest/v1/concept.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const biometricsOverview = getAsyncLifecycle(
  () => import('./biometrics/biometrics-overview.component'),
  options,
);

export const biometricsDetailedSummary = getAsyncLifecycle(
  () => import('./biometrics/biometrics-main.component'),
  options,
);

export const vitalsAndBiometricsDashboardLink =
  // t('Vitals & Biometrics')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const weightTile = getAsyncLifecycle(() => import('./biometrics/weight-tile.component'), options);
