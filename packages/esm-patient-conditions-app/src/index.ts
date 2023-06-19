import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-conditions-app';

const options = {
  featureName: 'patient-conditions',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const conditionsOverview = () =>
  getAsyncLifecycle(() => import('./conditions/conditions-overview.component'), options);

export const conditionsDetailedSummary = () =>
  getAsyncLifecycle(() => import('./conditions/conditions-detailed-summary.component'), options);

export const conditionsWidget = () =>
  getAsyncLifecycle(() => import('./conditions/conditions-widget.component'), options);

export const conditionsDashboardLink = () =>
  // t('conditions_link', 'Conditions')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      title: () =>
        Promise.resolve(
          window.i18next?.t('conditions_link', { defaultValue: 'Conditions', ns: moduleName }) ?? 'Conditions',
        ),
    }),
    options,
  );
export const conditionsFormWorkspace = () =>
  getAsyncLifecycle(() => import('./conditions/conditions-form.component'), options);

export const conditionsDeleteConfirmationDialog = () =>
  getAsyncLifecycle(() => import('./conditions/delete-condition-modal.component'), options);
