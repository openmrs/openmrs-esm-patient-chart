import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import deceasedPatientTagComponent from './banner-tags/deceased-patient-tag.extension';
import patientBannerComponent from './banner/patient-banner.component';
import visitTagComponent from './banner-tags/visit-tag.extension';

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

export const printIdentifierStickerModal = getAsyncLifecycle(
  () => import('./banner-tags/print-identifier-sticker.modal'),
  options,
);

/*
  The translations for built-in address fields are kept here in patient-banner.
  This comment ensures that they are included in the translations files.

  t('address1', 'Address line 1')
  t('address2', 'Address line 2')
  t('city', 'City')
  t('cityVillage', 'City')
  t('country', 'Country')
  t('countyDistrict', 'District')
  t('district', 'District')
  t('postalCode', 'Postal code')
  t('state', 'State')
  t('stateProvince', 'State')
*/
