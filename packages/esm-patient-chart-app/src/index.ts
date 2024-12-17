import {
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import * as PatientCommonLib from '@openmrs/esm-patient-common-lib';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schema';
import genericDashboardComponent, { genericDashboardConfigSchema } from './side-nav/generic-dashboard.component';
import genericNavGroupComponent, { genericNavGroupConfigSchema } from './side-nav/generic-nav-group.component';
import { moduleName } from './constants';
import { setupOfflineVisitsSync, setupCacheableRoutes } from './offline';
import { summaryDashboardMeta, encountersDashboardMeta } from './dashboard.meta';
import addPastVisitActionButtonComponent from './actions-buttons/add-past-visit.component';
import cancelVisitActionButtonComponent from './actions-buttons/cancel-visit.component';
import currentVisitSummaryComponent from './visit/visits-widget/current-visit-summary.component';
import markPatientAliveActionButtonComponent from './actions-buttons/mark-patient-alive.component';
import markPatientDeceasedActionButtonComponent from './actions-buttons/mark-patient-deceased.component';
import pastVisitsDetailOverviewComponent from './visit/past-visit-overview.component';
import pastVisitsOverviewComponent from './visit/visits-widget/visit-detail-overview.component';
import patientChartPageComponent from './root.component';
import patientDetailsTileComponent from './patient-details-tile/patient-details-tile.component';
import startVisitActionButtonComponent from './actions-buttons/start-visit.component';
import startVisitActionButtonOnPatientSearch from './visit/start-visit-button.component';
import startVisitFormComponent from './visit/visit-form/visit-form.component';
import stopVisitActionButtonComponent from './actions-buttons/stop-visit.component';
import visitAttributeTagsComponent from './patient-banner-tags/visit-attribute-tags.component';
import encounterListTabsComponent from './clinical-views/components/encounter-list-tabs.component';

// This allows @openmrs/esm-patient-common-lib to be accessed by modules that are not
// using webpack. This is used for ngx-formentry.
window['_openmrs_esm_patient_common_lib'] = PatientCommonLib;

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  setupOfflineVisitsSync();
  setupCacheableRoutes();

  defineConfigSchema(moduleName, esmPatientChartSchema);
  defineExtensionConfigSchema('nav-group', genericNavGroupConfigSchema);
  defineExtensionConfigSchema('dashboard', genericDashboardConfigSchema);

  registerFeatureFlag(
    'rde',
    'Retrospective Data Entry',
    "Features to enter data for past visits. Includes the 'Edit Past Visit' button in the start visit dialog, and the 'Add Past Visit' button in the patient header.",
  );
}

export const root = getSyncLifecycle(patientChartPageComponent, { featureName: 'patient-chart', moduleName });

export const patientSummaryDashboardLink =
  // t('Patient Summary', 'Patient Summary')
  getSyncLifecycle(
    createDashboardLink({
      ...summaryDashboardMeta,
      moduleName,
    }),
    {
      featureName: 'summary-dashboard',
      moduleName,
    },
  );

export const markPatientAliveActionButton = getSyncLifecycle(markPatientAliveActionButtonComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const markPatientDeceasedActionButton = getSyncLifecycle(markPatientDeceasedActionButtonComponent, {
  featureName: 'patient-actions-slot-deceased-button',
  moduleName,
});

export const startVisitActionButton = getSyncLifecycle(startVisitActionButtonComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const stopVisitActionButton = getSyncLifecycle(stopVisitActionButtonComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const cancelVisitActionButton = getSyncLifecycle(cancelVisitActionButtonComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const addPastVisitActionButton = getSyncLifecycle(addPastVisitActionButtonComponent, {
  featureName: 'patient-actions-slot-add-past-visit-button',
  moduleName,
});

export const startVisitPatientSearchActionButton = getSyncLifecycle(startVisitActionButtonOnPatientSearch, {
  featureName: 'start-visit-button-patient-search',
  moduleName,
});

export const stopVisitPatientSearchActionButton = getSyncLifecycle(stopVisitActionButtonComponent, {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const cancelVisitPatientSearchActionButton = getSyncLifecycle(cancelVisitActionButtonComponent, {
  featureName: 'patient-actions-slot-cancel-visit-button',
  moduleName,
});

export const addPastVisitPatientSearchActionButton = getSyncLifecycle(addPastVisitActionButtonComponent, {
  featureName: 'patient-search-actions-slot-add-past-visit-button',
  moduleName,
});

export const encountersSummaryDashboardLink =
  // t('Visits', 'Visits')
  getSyncLifecycle(
    createDashboardLink({
      ...encountersDashboardMeta,
      moduleName,
    }),
    { featureName: 'encounter', moduleName },
  );

export const currentVisitSummary = getSyncLifecycle(currentVisitSummaryComponent, {
  featureName: 'current-visit-summary',
  moduleName,
});

export const pastVisitsOverview = getSyncLifecycle(pastVisitsDetailOverviewComponent, {
  featureName: 'past-visits-overview',
  moduleName,
});

export const pastVisitsDetailOverview = getSyncLifecycle(pastVisitsOverviewComponent, {
  featureName: 'visits-detail-slot',
  moduleName,
});

export const patientDetailsTile = getSyncLifecycle(patientDetailsTileComponent, {
  featureName: 'patient-details-tile',
  moduleName,
});

export const visitAttributeTags = getSyncLifecycle(visitAttributeTagsComponent, {
  featureName: 'visit-attribute-tags',
  moduleName,
});

export const genericNavGroup = getSyncLifecycle(genericNavGroupComponent, {
  featureName: 'Nav group',
  moduleName,
});

export const genericDashboard = getSyncLifecycle(genericDashboardComponent, {
  featureName: 'Dashboard',
  moduleName,
});

export const startVisitForm = getSyncLifecycle(startVisitFormComponent, {
  featureName: 'start-visit-form',
  moduleName,
});

// t('markPatientDeceased', 'Mark patient deceased')
export const markPatientDeceasedForm = getAsyncLifecycle(
  () => import('./mark-patient-deceased/mark-patient-deceased-form.workspace'),
  {
    featureName: 'mark-patient-deceased-form',
    moduleName,
  },
);

export const cancelVisitModal = getAsyncLifecycle(() => import('./visit/visit-prompt/cancel-visit-dialog.component'), {
  featureName: 'cancel visit',
  moduleName,
});

export const startVisitModal = getAsyncLifecycle(() => import('./visit/visit-prompt/start-visit-dialog.component'), {
  featureName: 'start visit',
  moduleName,
});

export const deleteVisitModal = getAsyncLifecycle(() => import('./visit/visit-prompt/delete-visit-dialog.component'), {
  featureName: 'delete visit',
  moduleName,
});

export const modifyVisitDateModal = getAsyncLifecycle(() => import('./visit/visit-prompt/modify-visit-date.modal'), {
  featureName: 'modify visit date',
  moduleName,
});

export const endVisitModal = getAsyncLifecycle(() => import('./visit/visit-prompt/end-visit-dialog.component'), {
  featureName: 'end visit',
  moduleName,
});

export const markPatientAliveModal = getAsyncLifecycle(() => import('./mark-patient-alive/mark-patient-alive.modal'), {
  featureName: 'mark patient alive',
  moduleName,
});

export const deleteEncounterModal = getAsyncLifecycle(
  () => import('./visit/visits-widget/past-visits-components/delete-encounter.modal'),
  {
    featureName: 'delete-encounter-modal',
    moduleName,
  },
);

export const editVisitDetailsActionButton = getAsyncLifecycle(
  () => import('./visit/visit-action-items/edit-visit-details.component'),
  { featureName: 'edit-visit-details', moduleName },
);

export const deleteVisitActionButton = getAsyncLifecycle(
  () => import('./visit/visit-action-items/delete-visit-action-item.component'),
  { featureName: 'delete-visit', moduleName },
);

export const activeVisitActionsComponent = getAsyncLifecycle(
  () => import('./visit/visits-widget/active-visit-buttons/active-visit-buttons'),
  { featureName: 'active-visit-actions', moduleName },
);

export const encounterListTableTabs = getSyncLifecycle(encounterListTabsComponent, {
  featureName: 'encounter-list-table-tabs',
  moduleName,
});
