import {
  registerBreadcrumbs,
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  defineExtensionConfigSchema,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import * as PatientCommonLib from '@openmrs/esm-patient-common-lib';
import { esmPatientChartSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';
import { summaryDashboardMeta, encountersDashboardMeta } from './dashboard.meta';
import { setupOfflineVisitsSync, setupCacheableRoutes } from './offline';
import { genericDashboardConfigSchema } from './side-nav/generic-dashboard.component';
import { genericNavGroupConfigSchema } from './side-nav/generic-nav-group.component';

// This allows @openmrs/esm-patient-common-lib to be accessed by modules that are not
// using webpack. This is used for ngx-formentry.
window["_openmrs_esm_patient_common_lib"] = PatientCommonLib;

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  setupOfflineVisitsSync();
  setupCacheableRoutes();

  defineConfigSchema(moduleName, esmPatientChartSchema);
  defineExtensionConfigSchema('nav-group', genericNavGroupConfigSchema);
  defineExtensionConfigSchema('dashboard', genericDashboardConfigSchema);

  /**
   * This comment tells i18n to still keep the following translation keys (DO NOT DELETE THESE):
   *
   * t('patientBreadcrumb', 'Patient')
   * t('Patient Summary dashboard', 'Patient Summary dashboard')
   * t('Allergies dashboard', 'Allergies dashboard')
   * t('Appointments dashboard', 'Appointments dashboard')
   * t('Vitals & Biometrics dashboard', 'Vitals & Biometrics dashboard')
   * t('Medications dashboard', 'Medications dashboard')
   * t('Visits dashboard', 'Visits dashboard')
   * t('Conditions dashboard', 'Conditions dashboard')
   * t('Attachments dashboard', 'Attachments dashboard')
   * t('Programs dashboard', 'Programs dashboard')
   * t('Offline Actions dashboard', 'Offline Actions dashboard')
   * t('Forms & Notes dashboard', 'Forms & Notes dashboard')
   * t('Test Results dashboard', 'Test Results dashboard')
   */
  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: () => Promise.resolve(window.i18next.t('patientBreadcrumb', { defaultValue: 'Patient', ns: moduleName })),
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:view`,
      title: ([_, key]) =>
        Promise.resolve(
          window.i18next.t(`${decodeURIComponent(key)} dashboard`, {
            ns: moduleName,
            defaultValue: `${decodeURIComponent(key)} dashboard`,
          }),
        ),
      parent: spaBasePath,
    },
  ]);

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

export const startVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/start-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const stopVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/stop-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const markPatientAliveActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/mark-patient-alive.component'),
  {
    featureName: 'patient-actions-slot',
    moduleName,
  },
);

export const stopVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/stop-visit.component'),
  {
    featureName: 'patient-actions-slot',
    moduleName,
  },
);

export const cancelVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/cancel-visit.component'), {
  featureName: 'patient-actions-slot',
  moduleName,
});

export const markPatientDeceasedActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/mark-patient-deceased.component'),
  {
    featureName: 'patient-actions-slot-deceased-button',
    moduleName,
  },
);

export const cancelVisitPatientSearchActionButton = getAsyncLifecycle(
  () => import('./actions-buttons/cancel-visit.component'),
  {
    featureName: 'patient-actions-slot-cancel-visit-button',
    moduleName,
  },
);

export const addPastVisitActionButton = getAsyncLifecycle(() => import('./actions-buttons/add-past-visit.component'), {
  featureName: 'patient-actions-slot-add-past-visit-button',
  moduleName,
});

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

export const pastVisitsDetailOverview = getAsyncLifecycle(
  () => import('./visit/visits-widget/visit-detail-overview.component'),
  {
    featureName: 'visits-detail-slot',
    moduleName,
  },
);

export const pastVisitsOverview = getAsyncLifecycle(() => import('./visit/past-visit-overview.component'), {
  featureName: 'past-visits-overview',
  moduleName,
});

export const startVisitForm = getAsyncLifecycle(() => import('./visit/visit-form/visit-form.component'), {
  featureName: 'start-visit-form',
  moduleName,
});

export const markPatientDeceasedForm = getAsyncLifecycle(() => import('./deceased/deceased-form.component'), {
  featureName: 'mark-patient-deceased-form',
  moduleName,
});

export const patientDetailsTile = getAsyncLifecycle(
  () => import('./patient-details-tile/patient-details-tile.component'),
  {
    featureName: 'patient-details-tile',
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

export const cancelVisitDialog = getAsyncLifecycle(() => import('./visit/visit-prompt/cancel-visit-dialog.component'), {
  featureName: 'cancel visit',
  moduleName,
});

export const startVisitDialog = getAsyncLifecycle(() => import('./visit/visit-prompt/start-visit-dialog.component'), {
  featureName: 'start visit',
  moduleName,
});

export const endVisitDialog = getAsyncLifecycle(() => import('./visit/visit-prompt/end-visit-dialog.component'), {
  featureName: 'end visit',
  moduleName,
});

export const confirmDeceasedDialog = getAsyncLifecycle(() => import('./deceased/confirmation-dialog.component'), {
  featureName: 'confirm death',
  moduleName,
});

export const confirmAliveDialog = getAsyncLifecycle(() => import('./deceased/mark-alive-modal.component'), {
  featureName: 'confirm alive',
  moduleName,
});

export const startVisitButtonPatientSearch = getAsyncLifecycle(() => import('./visit/start-visit-button.component'), {
  featureName: 'start-visit-button-patient-search',
  moduleName,
});

export const visitAttributeTags = getAsyncLifecycle(
  () => import('./patient-banner-tags/visit-attribute-tags.component'),
  {
    featureName: 'visit-attribute-tags',
    moduleName,
  },
);

export const deleteEncounterModal = getAsyncLifecycle(
  () => import('./visit/visits-widget/past-visits-components/delete-encounter-modal.component'),
  {
    featureName: 'delete-encounter-modal',
    moduleName,
  },
);

export const currentVisitSummary = getAsyncLifecycle(
  () => import('./visit/visits-widget/current-visit-summary.component'),
  {
    featureName: 'current-visit-summary',
    moduleName,
  },
);
