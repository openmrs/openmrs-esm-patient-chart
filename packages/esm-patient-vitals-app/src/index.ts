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
import vitalsSummaryComponent from './vitals/vitals-summary.component';
import vitalsMainComponent from './vitals/vitals-main.component';
import vitalsHeaderComponent from './vitals-and-biometrics-header/vitals-header.component';
import biometricsOverviewComponent from './biometrics/biometrics-overview.component';
import biometricsDetailedSummaryComponent from './biometrics/biometrics-main.component';

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

export const vitalsSummary = getSyncLifecycle(vitalsSummaryComponent, options);

export const vitalsMain = getSyncLifecycle(vitalsMainComponent, options);

export const vitalsHeader = getSyncLifecycle(vitalsHeaderComponent, options);

export const biometricsOverview = getSyncLifecycle(biometricsOverviewComponent, options);

export const biometricsDetailedSummary = getSyncLifecycle(biometricsDetailedSummaryComponent, options);

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
