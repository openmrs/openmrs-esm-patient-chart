import { defineConfigSchema, getSyncLifecycle, messageOmrsServiceWorker, restBaseUrl } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import visitTagComponent from './banner-tags/visit-tag.component';
import deceasedPatientTagComponent from './banner-tags/deceased-patient-tag.component';
import patientBannerComponent from './banner/patient-banner.component';

const moduleName = '@openmrs/esm-patient-banner-app';

const options = {
  featureName: 'patient-banner',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/relationship.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const visitTag = getSyncLifecycle(visitTagComponent, options);

export const deceasedPatientTag = getSyncLifecycle(deceasedPatientTagComponent, options);

export const patientBanner = getSyncLifecycle(patientBannerComponent, options);
