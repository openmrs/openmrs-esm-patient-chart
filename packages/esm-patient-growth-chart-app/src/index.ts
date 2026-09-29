import { getAsyncLifecycle, getSyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import { dashboardMeta } from './dashboard.meta';

const options = {
  featureName: 'patient-growth-chart-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// Extensions
// t('Growth chart', 'Growth chart')
export const growthChartDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta }), options);

export const growthChartMain = getAsyncLifecycle(() => import('./growth-chart/growth-chart.component'), options);
