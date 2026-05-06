import { getAsyncLifecycle, getSyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import proceduresOverviewComponent from './procedures/procedures-overview.component';
import proceduresDetailedSummaryComponent from './procedures/procedures-detailed-summary.component';
import proceduresFormWorkspaceComponent from './procedures/procedures-form.workspace';
import { moduleName } from './constants';

const options = {
  featureName: 'patient-procedures-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// Extensions
export const proceduresOverview = getSyncLifecycle(proceduresOverviewComponent, options);

export const proceduresDetailedSummary = getSyncLifecycle(proceduresDetailedSummaryComponent, options);

export const proceduresDashboardLink =
  // t('Procedures', 'Procedures')
  getSyncLifecycle(createDashboardLink({ ...dashboardMeta }), options);

export const proceduresFormWorkspace = getSyncLifecycle(proceduresFormWorkspaceComponent, options);

export const procedureDeleteConfirmationDialog = getAsyncLifecycle(
  () => import('./procedures/delete-procedure.modal'),
  options,
);
