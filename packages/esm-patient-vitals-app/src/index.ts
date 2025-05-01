import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import biometricsDetailedSummaryComponent from './biometrics/biometrics-main.component';
import biometricsOverviewComponent from './biometrics/biometrics-overview.component';
import dashboardMeta from './dashboard.meta';
import vitalsHeaderComponent from './vitals-and-biometrics-header/vitals-header.component';
import vitalsMainComponent from './vitals/vitals-main.component';
import vitalsSummaryComponent from './vitals/vitals-summary.component';

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
    pattern: `.+${restBaseUrl}/concept.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const vitalsSummary = getSyncLifecycle(vitalsSummaryComponent, options);

export const vitalsMain = getSyncLifecycle(vitalsMainComponent, options);

export const vitalsHeader = getSyncLifecycle(vitalsHeaderComponent, options);

export const biometricsOverview = getSyncLifecycle(biometricsOverviewComponent, options);

export const biometricsDetailedSummary = getSyncLifecycle(biometricsDetailedSummaryComponent, options);

export const vitalsAndBiometricsDashboardLink =
  // t('Vitals & Biometrics', 'Vitals & Biometrics')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const weightTile = getAsyncLifecycle(() => import('./components/weight-tile/weight-tile.component'), options);

// t('recordVitalsAndBiometrics', 'Record Vitals and Biometrics')
export const vitalsBiometricsFormWorkspace = getAsyncLifecycle(
  () => import('./vitals-biometrics-form/vitals-biometrics-form.workspace'),
  options,
);

export const vitalsAndBiometricsDeleteConfirmationModal = getAsyncLifecycle(
  () => import('./components/delete-vitals-biometrics-modal/delete-vitals-biometrics.modal'),
  options,
);
