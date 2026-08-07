import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-growth-chart-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

defineConfigSchema(moduleName, configSchema);

export const growthChartWidget = getAsyncLifecycle(() => import('./growth-chart/growth-chart.component'), {
  featureName: 'patient-growth-chart',
  moduleName,
});
