import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { moduleName } from './constants';
import auditHistoryComponent from './audit-history/audit-history.component';

const options = {
  featureName: 'patient-audit-history',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const auditHistoryDashboard = getSyncLifecycle(auditHistoryComponent, options);

// t('Audit History', 'Audit History')
export const auditHistoryDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta }), options);
