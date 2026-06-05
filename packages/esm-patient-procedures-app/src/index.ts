import { getAsyncLifecycle, getSyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { moduleName } from './constants';
import ProceduresDetailedSummary from './components/detailed-summary/procedures-detailed-summary.component';
import ProceduresFormWorkspace from './workspaces/procedures-form/procedures-form.workspace';

const options = {
  featureName: 'patient-procedures-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const startupApp = () => {
  defineConfigSchema(moduleName, configSchema);
};

// Extensions
export const proceduresDetailedSummary = getSyncLifecycle(ProceduresDetailedSummary, options);

export const proceduresDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta }), options);

export const proceduresFormWorkspace = getSyncLifecycle(ProceduresFormWorkspace, options);

export const procedureDeleteConfirmationDialog = getAsyncLifecycle(
  () => import('./modals/delete-procedure/delete-procedure.modal'),
  options,
);
