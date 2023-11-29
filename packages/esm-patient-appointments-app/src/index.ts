import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';
import appointmentsOverviewComponent from './appointments/appointments-overview.component';
import appointmentsDetailedSummaryComponent from './appointments/appointments-detailed-summary.component';
import upcomingAppointmentsWidgetComponent from './appointments/upcoming-appointments-card.component';
import { t } from 'i18next';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-appointments-app';

const options = {
  featureName: 'patient-appointments',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, {});

  registerWorkspace({
    name: 'appointments-form-workspace',
    title: translateFrom('@openmrs/esm-patient-appointments-app', 'scheduleAppointment', 'Schedule appointment'),
    load: getAsyncLifecycle(() => import('./appointments/appointments-form/appointments-form.component'), options),
  });
}

export const appointmentsOverview = getSyncLifecycle(appointmentsOverviewComponent, options);

export const appointmentsDetailedSummary = getSyncLifecycle(appointmentsDetailedSummaryComponent, options);

// t('Appointments', 'Appointments')
export const appointmentsSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const appointmentsCancelConfirmationDialog = getAsyncLifecycle(
  () => import('./appointments/appointments-cancel-modal.component'),
  options,
);

export const upcomingAppointmentsWidget = getSyncLifecycle(upcomingAppointmentsWidgetComponent, options);
