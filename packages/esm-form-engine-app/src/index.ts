import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-form-engine-app';

const options = {
  featureName: 'form-engine',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const formRenderer = getAsyncLifecycle(() => import('./form-renderer/form-renderer.component'), options);

export const formCollapseToggle = getAsyncLifecycle(
  () => import('./form-collapse-toggle/form-collapse-toggle.component'),
  {
    featureName: 'rfe-form-collapse-toggle',
    moduleName,
  },
);

export const deleteQuestionModal = getAsyncLifecycle(
  () => import('./form-renderer/repeat/delete-question-modal.component'),
  options,
);
