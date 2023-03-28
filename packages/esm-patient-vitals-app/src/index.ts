import { defineConfigSchema, fhirBaseUrl, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';

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
        name: 'vitals-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: getPatientSummaryOrder('Vitals'),
        load: getAsyncLifecycle(() => import('./vitals/vitals-summary.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddVitals: true },
        offline: { showAddVitals: false },
      },
      {
        name: 'vitals-details-widget',
        slot: 'patient-chart-vitals-biometrics-dashboard-slot',
        load: getAsyncLifecycle(() => import('./vitals/vitals-main.component'), options),
        meta: {
          view: 'vitals',
          title: 'Vitals',
        },
        order: 1,
        online: { showAddVitals: true },
        offline: { showAddVitals: false },
      },
      {
        name: 'patient-vitals-info',
        slot: 'patient-info-slot',
        load: getAsyncLifecycle(() => import('./vitals/vitals-header/vitals-header.component'), options),
        online: { showRecordVitalsButton: true },
        offline: { showRecordVitalsButton: false },
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

export { backendDependencies, importTranslation, setupOpenMRS, version };
