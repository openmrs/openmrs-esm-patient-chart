import { getSyncLifecycle, defineConfigSchema, createDashboard } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import { dashboardMeta } from './dashboard.meta';
import patientGrowthChartAppComponent from './growth-chart/growth-chart.component';

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
export const growthChartDashboardLink = getSyncLifecycle(createDashboard({ ...dashboardMeta }), options);

export const growthChartMain = getSyncLifecycle(patientGrowthChartAppComponent, options);
