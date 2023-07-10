import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-appointments-app';

const options = {
  featureName: 'patient-appointments',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, {});
}

export const appointmentsOverview = getAsyncLifecycle(
  () => import('./appointments/appointments-overview.component'),
  options,
);

export const appointmentsDetailedSummary = getAsyncLifecycle(
  () => import('./appointments/appointments-detailed-summary.component'),
  options,
);

export const appointmentsSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const appointmentsFormWorkspace = getAsyncLifecycle(
  () => import('./appointments/appointments-form/appointments-form.component'),
  options,
);

export const appointmentsCancelConfirmationDialog = getAsyncLifecycle(
  () => import('./appointments/appointments-cancel-modal.component'),
  options,
);

export const upcomingAppointmentsWidget = getAsyncLifecycle(
  () => import('./appointments/upcoming-appointments-card.component'),
  options,
);
