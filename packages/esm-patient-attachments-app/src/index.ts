import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { attachmentsConfigSchema } from './attachments-config-schema';
import { dashboardMeta } from './dashboard.meta';
import attachmentsOverviewComponent from './attachments/attachments-overview.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-attachments-app';

export function startupApp() {
  defineConfigSchema(moduleName, attachmentsConfigSchema);
}

export const attachmentsOverview = getSyncLifecycle(attachmentsOverviewComponent, {
  featureName: 'patient-attachments',
  moduleName,
});

// t('Attachments', 'Attachments')
export const attachmentsSummaryResultsDashboard = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
  }),
  {
    featureName: 'attachments-dashboard-link',
    moduleName,
  },
);

export const capturePhotoModal = getAsyncLifecycle(
  () => import('./camera-media-uploader/camera-media-uploader.component'),
  {
    featureName: 'capture-photo-modal',
    moduleName,
  },
);

export const capturePhotoWidget = getAsyncLifecycle(() => import('./camera-media-uploader/capture-photo.component'), {
  featureName: 'capture-photo-widget',
  moduleName,
});

export const deleteAttachmentModal = getAsyncLifecycle(() => import('./attachments/delete-attachment.modal'), {
  featureName: 'delete-attachment-modal',
  moduleName,
});
