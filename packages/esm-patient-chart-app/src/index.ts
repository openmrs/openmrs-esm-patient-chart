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
import { moduleName } from './constants';
import { setupCacheableRoutes, setupOfflineVisitsSync } from './offline';
import { summaryDashboardMeta, encountersDashboardMeta } from './dashboard.meta';
import { genericDashboardConfigSchema } from './side-nav/generic-dashboard.component';
import { genericNavGroupConfigSchema } from './side-nav/generic-nav-group.component';

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

export const root = getAsyncLifecycle(() => import('./root.component'), { featureName: 'patient-chart', moduleName });

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

export const markPatientAliveActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/mark-patient-alive.component'),
  {
    featureName: 'patient-actions-slot',
    moduleName,
  },
);

export const markPatientDeceasedActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/mark-patient-deceased.component'),
  {
    featureName: 'patient-actions-slot-deceased-button',
    moduleName,
  },
);

export const startVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/start-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const stopVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/stop-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const cancelVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/cancel-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const addPastVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
  featureName: 'patient-actions-slot-add-past-visit-button',
  moduleName,
});

export const startVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./visit/start-visit-button.component'),
  {
    featureName: 'start-visit-button-patient-search',
    moduleName,
  },
);

export const stopVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./visit/start-visit-button.component'),
  {
    featureName: 'patient-actions-slot',
    moduleName,
  },
);

export const clinicalViewsSummary = getAsyncLifecycle(
  () => import('./clinical-views/encounter-tile/clinical-views-summary.component'),
  { featureName: 'clinical-views-summary', moduleName },
);

export const cancelVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/cancel-visit.component'),
  {
    featureName: 'patient-actions-slot-cancel-visit-button',
    moduleName,
  },
);

export const addPastVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/add-past-visit.component'),
  {
    featureName: 'patient-search-actions-slot-add-past-visit-button',
    moduleName,
  },
);

export const encountersSummaryDashboardLink =
  // t('Visits', 'Visits')
  getSyncLifecycle(
    createDashboardLink({
      ...encountersDashboardMeta,
      moduleName,
    }),
    { featureName: 'encounter', moduleName },
  );

export const currentVisitSummary = getAsyncLifecycle(
  () => import('./visit/visits-widget/current-visit-summary.component'),
  {
    featureName: 'current-visit-summary',
    moduleName,
  },
);

export const pastVisitsOverview = getAsyncLifecycle(() => import('./visit/past-visit-overview.component'), {
  featureName: 'past-visits-overview',
  moduleName,
});

export const pastVisitsDetailOverview = getAsyncLifecycle(
  () => import('./visit/visits-widget/visit-detail-overview.component'),
  {
    featureName: 'visits-detail-slot',
    moduleName,
  },
);

export const patientDetailsTile = getAsyncLifecycle(
  () => import('./patient-details-tile/patient-details-tile.component'),
  {
    featureName: 'patient-details-tile',
    moduleName,
  },
);

export const visitAttributeTags = getAsyncLifecycle(
  () => import('./patient-banner-tags/visit-attribute-tags.component'),
  {
    featureName: 'visit-attribute-tags',
    moduleName,
  },
);

export const genericNavGroup = getAsyncLifecycle(() => import('./side-nav/generic-nav-group.component'), {
  featureName: 'Nav group',
  moduleName,
});

export const genericDashboard = getAsyncLifecycle(() => import('./side-nav/generic-dashboard.component'), {
  featureName: 'Dashboard',
  moduleName,
});

// t('startVisitWorkspaceTitle', 'Start a visit')
export const startVisitWorkspace = getAsyncLifecycle(() => import('./visit/visit-form/visit-form.workspace'), {
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

export const encounterListTableTabs = getAsyncLifecycle(
  () => import('./clinical-views/encounter-list/encounter-list-tabs.component'),
  { featureName: 'encounter-list-table-tabs', moduleName },
);
