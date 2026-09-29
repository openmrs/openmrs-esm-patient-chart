import 'reflect-metadata';
import 'zone.js';
import { defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

// FIXME: Workaround https://github.com/single-spa/single-spa-angular/issues/463#issuecomment-1468350850
// @ts-ignore
require('./styles.css?ngGlobalStyle');

const moduleName = '@openmrs/esm-form-entry-app';

export const importTranslation = import.meta.webpackContext('../translations', {
  regExp: /\.json$/,
  recursive: false,
  mode: 'lazy',
});

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

/**
 * Returns a fresh set of single-spa lifecycle functions for each call so that
 * multiple concurrent form instances each get their own independent Angular
 * application, DOM binding, and props context.
 */
export const formWidget = async () => {
  const { createLifecycles } = await import('./bootstrap');
  return createLifecycles();
};
