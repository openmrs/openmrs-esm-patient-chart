import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { attachmentsConfigSchema } from './attachments-config-schema';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-attachments-app';

export const attachmentsOverview = () =>
  getAsyncLifecycle(() => import('./attachments/attachments-overview.component'), {
    featureName: 'patient-attachments',
    moduleName,
  });

// t('attachments_link', 'Attachments')
export const attachmentsSummaryResultsDashboard = () =>
  getSyncLifecycle(
    createDashboardLink({
      ...dashboardMeta,
      title: () =>
        Promise.resolve(
          window.i18next?.t('attachments_link', { defaultValue: 'Attachments', ns: moduleName }) ?? 'Attachments',
        ),
    }),
    {
      featureName: 'attachments-dashboard-link',
      moduleName,
    },
  );

export const capturePhotoModal = () =>
  getAsyncLifecycle(() => import('./camera-media-uploader/camera-media-uploader.component'), {
    featureName: 'capture-photo-modal',
    moduleName,
  });

export const capturePhotoWidget = () =>
  getAsyncLifecycle(() => import('./camera-media-uploader/capture-photo.component'), {
    featureName: 'capture-photo-widget',
    moduleName,
  });

export const deleteAttachmentModal = () =>
  getAsyncLifecycle(() => import('./attachments/delete-attachment-confirmation-modal.component'), {
    featureName: 'delete-attachment-modal',
    moduleName,
  });

export function startupApp() {
  defineConfigSchema(moduleName, attachmentsConfigSchema);
}
