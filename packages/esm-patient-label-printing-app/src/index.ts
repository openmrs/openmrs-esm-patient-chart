import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-printing-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const printIdentifierStickerActionButton = getAsyncLifecycle(
  () => import('./print-identifier-sticker/print-identifier-sticker-action-button.component'),
  {
    featureName: 'patient-actions-slot-print-identifier-sticker-button',
    moduleName,
  },
);
