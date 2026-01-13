import { getSyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import { dashboardMeta } from './dashboard.meta';
import patientGrowthChartAppComponent from './growth-chart/growth-chart-main.component';

const options = {
  featureName: 'patient-growth-chart-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// Extensions
export const growthChartDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta }), options);

export const growthChartMain = getSyncLifecycle(patientGrowthChartAppComponent, options);
