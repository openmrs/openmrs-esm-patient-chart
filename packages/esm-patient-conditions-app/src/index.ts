import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import conditionsOverviewComponent from './conditions/conditions-overview.component';
import conditionsDetailedSummaryComponent from './conditions/conditions-detailed-summary.component';

const moduleName = '@openmrs/esm-patient-conditions-app';

const options = {
  featureName: 'patient-conditions',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const conditionsOverview = getSyncLifecycle(conditionsOverviewComponent, options);

export const conditionsDetailedSummary = getSyncLifecycle(conditionsDetailedSummaryComponent, options);

export const conditionsWidget = getAsyncLifecycle(() => import('./conditions/conditions-widget.component'), options);

export const conditionsDashboardLink =
  // t('Conditions', 'Conditions')
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      moduleName,
    }),
    options,
  );

export const conditionsFormWorkspace = getAsyncLifecycle(
  () => import('./conditions/conditions-form.component'),
  options,
);

export const conditionDeleteConfirmationDialog = getAsyncLifecycle(
  () => import('./conditions/delete-condition-modal.component'),
  options,
);
