import { defineConfigSchema, defineExtensionConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { riskCountExtensionConfigSchema } from './flags/flags-risk-count-extension/extension-config-schema';

const moduleName = '@openmrs/esm-patient-flags-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  defineExtensionConfigSchema('patient-flags-risk-count', riskCountExtensionConfigSchema);
}

export const flagsRiskCountExtension = getAsyncLifecycle(
  () => import('./flags/flags-risk-count-extension/flags-risk-count.extension'),
  {
    featureName: 'patient-flags-risk-count',
    moduleName,
  },
);

export const flagsListExtension = getAsyncLifecycle(() => import('./flags/flags-list-extension/flags-list.extension'), {
  featureName: 'patient-flags-overview',
  moduleName,
});

export const patientFlagsWorkspace = getAsyncLifecycle(() => import('./flags/flags-workspace/flags.workspace'), {
  featureName: 'patient-flags-workspace',
  moduleName,
});

/**
 * DO NOT REMOVE THE FOLLOWING TRANSLATIONS
 * t('editPatientFlags','Edit patient flags')
 */
