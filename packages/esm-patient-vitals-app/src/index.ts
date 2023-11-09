import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import dashboardMeta from './dashboard.meta';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-vitals-app';

const options = {
  featureName: 'patient-vitals',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `${fhirBaseUrl}/Observation.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+/ws/rest/v1/concept.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const vitalsSummary = getAsyncLifecycle(() => import('./vitals/vitals-summary.component'), options);

export const vitalsMain = getAsyncLifecycle(() => import('./vitals/vitals-main.component'), options);

export const vitalsHeader = getAsyncLifecycle(
  () => import('./vitals-and-biometrics-header/vitals-header.component'),
  options,
);

export const biometricsOverview = getAsyncLifecycle(
  () => import('./biometrics/biometrics-overview.component'),
  options,
);

export const biometricsDetailedSummary = getAsyncLifecycle(
  () => import('./biometrics/biometrics-main.component'),
  options,
);

export const vitalsAndBiometricsForm = getAsyncLifecycle(
  () => import('./vitals-biometrics-form/vitals-biometrics-form.component'),
  options,
);

export const vitalsAndBiometricsDashboardLink =
  // t('Vitals & Biometrics', 'Vitals & Biometrics')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const weightTile = getAsyncLifecycle(() => import('./weight-tile/weight-tile.component'), options);
