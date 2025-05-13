import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  registerFeatureFlag,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-label-printing-app';

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

  registerFeatureFlag(
    'print-patient-identifier-sticker',
    'Print patient identifier sticker',
    'Features to support printing a patient identifier sticker',
  );
  defineConfigSchema(moduleName, configSchema);
}

// export const printIdentifierStickerActionButton = getAsyncLifecycle(
//   () => import('./print-identifier-sticker/print-identifier-sticker-action-button.component'),
//   {
//     featureName: 'patient-actions-slot-print-identifier-sticker-button',
//     moduleName,
//   },
// );
