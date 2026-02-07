import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  registerBreadcrumbs,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import proceduresOverviewComponent from './procedures/procedures-overview.component';
import ProceduresDashboardLink from './procedures/procedures-dashboard-link.component';

const moduleName = '@openmrs/esm-patient-procedures-app';

const options = {
  featureName: 'patient-procedures',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  // Define config schema
  defineConfigSchema(moduleName, configSchema);

  // Register service worker routes
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/obs.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/concept.+`,
  });

  // Register breadcrumbs for the procedures page
  registerBreadcrumbs([
    {
      path: `${window.spaBase}/patient/:patientUuid/chart/procedures`,
      title: 'Procedures',
      parent: `${window.spaBase}/patient/:patientUuid/chart`,
    },
  ]);
}

// Export the procedures overview component
export const proceduresOverview = getSyncLifecycle(proceduresOverviewComponent, options);

// Export the dashboard link
export const proceduresDashboardLink = getSyncLifecycle(ProceduresDashboardLink, options);

// Export the procedures form workspace
export const proceduresFormWorkspace = getAsyncLifecycle(
  () => import('./procedures/procedures-form.workspace'),
  options,
);
