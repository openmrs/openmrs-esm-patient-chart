import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  registerFeatureFlag,
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
  registerFeatureFlag(
    'print-patient-identifier-sticker',
    'Print patient identifier sticker',
    'Features to support printing a patient identifier sticker',
  );
}

export const visitTag = getSyncLifecycle(visitTagComponent, options);

export const deceasedPatientTag = getSyncLifecycle(deceasedPatientTagComponent, options);

export const patientBanner = getSyncLifecycle(patientBannerComponent, options);

export const printIdentifierStickerModal = getAsyncLifecycle(
  () => import('./print-identifier-sticker/print-identifier-sticker.modal'),
  options,
);

export const printIdentifierStickerActionButton = getAsyncLifecycle(
  () => import('./print-identifier-sticker/print-identifier-sticker-action-button.component'),
  {
    featureName: 'patient-actions-slot-print-identifier-sticker-button',
    moduleName,
  },
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
