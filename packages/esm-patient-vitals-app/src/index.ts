import { defineConfigSchema, fhirBaseUrl, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir: '^1.4.2',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `${fhirBaseUrl}/Observation.+`,
  });

  const moduleName = '@openmrs/esm-patient-vitals-app';

  const options = {
    featureName: 'patient-vitals',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'vitals-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./vitals/vitals-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
        online: { showAddVitals: true },
        offline: { showAddVitals: false },
      },
      {
        id: 'vitals-details-widget',
        slot: 'patient-chart-results-dashboard-slot',
        load: getAsyncLifecycle(() => import('./vitals/vitals-overview.component'), options),
        meta: {
          view: 'vitals',
          title: 'Vitals',
        },
        online: { showAddVitals: true },
        offline: { showAddVitals: false },
      },
      {
        id: 'patient-vitals-info',
        slot: 'patient-info-slot',
        load: getAsyncLifecycle(() => import('./vitals/vitals-header/vital-header-state.component'), options),
        online: { showRecordVitals: true },
        offline: { showRecordVitals: false },
      },
      {
        id: patientVitalsBiometricsFormWorkspace,
        load: getAsyncLifecycle(
          () => import('./vitals/vitals-biometrics-form/vitals-biometrics-form.component'),
          options,
        ),
        meta: {
          title: {
            key: 'recordVitalsAndBiometrics',
            default: 'Record Vitals and Biometrics',
          },
        },
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
