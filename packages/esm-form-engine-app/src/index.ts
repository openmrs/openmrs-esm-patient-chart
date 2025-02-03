import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-form-engine-app';

const options = {
  featureName: 'form-engine',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const formRenderer = getAsyncLifecycle(() => import('./form-renderer/form-renderer.component'), options);

export const formCollapseToggle = getAsyncLifecycle(
  () => import('./form-collapse-toggle/form-collapse-toggle.component'),
  {
    featureName: 'rfe-form-collapse-toggle',
    moduleName,
  },
);

export const deleteQuestionModal = getAsyncLifecycle(
  () => import('./form-renderer/repeat/delete-question.modal'),
  options,
);

/**
 * DO NOT REMOVE THIS COMMENT
 * THE TRANSLATION KEYS AND VALUES USED IN THE FORM ENGINE LIB ARE WRITTEN HERE
 * t('add', 'Add');
 * t('addCameraImage', 'Add camera image');
 * t('addFile', 'Add files');
 * t('blank', 'Blank');
 * t('cameraCapture', 'Camera capture');
 * t('cancel', 'Cancel');
 * t('chooseAnOption', 'Choose an option');
 * t('clearFile', 'Clear file');
 * t('close', 'Close');
 * t('closeCamera', 'Close camera');
 * t('closeThisPanel', 'Close this panel');
 * t('closesNotification', 'Closes notification');
 * t('collapseAll', 'Collapse all');
 * t('deleteQuestion', 'Delete question');
 * t('deleteQuestionConfirmation', 'Are you sure you want to delete this question?');
 * t('deleteQuestionExplainerText', 'This action cannot be undone.');
 * t('errorLoadingFormSchema', 'Error loading form schema');
 * t('errorLoadingInitialValues', 'Error loading initial values');
 * t('errorRenderingField', 'Error rendering field');
 * t('errorTitle', 'There was an error with this form');
 * t('expandAll', 'Expand all');
 * t('fieldErrorDescriptionTitle', 'Validation Errors');
 * t('fileUploadDescription', 'Upload one of the following file types: {{fileTypes}}');
 * t('fileUploadDescriptionAny', 'Upload any file type');
 * t('invalidWorkspaceName', 'Invalid workspace name.');
 * t('invalidWorkspaceNameSubtitle', 'Please provide a valid workspace name.');
 * t('launchWorkspace', 'Launch Workspace');
 * t('loading', 'Loading');
 * t('notification', 'Notification');
 * t('nullMandatoryField', 'Please fill the required fields');
 * t('or', 'or');
 * t('preview', 'Preview');
 * t('previousValue', 'Previous value:');
 * t('remove', 'Remove');
 * t('required', 'Required');
 * t('reuseValue', 'Reuse value');
 * t('save', 'Save');
 * t('search', 'Search');
 * t('searching', 'Searching');
 * t('submitting', 'Submitting');
 * t('thisList', 'this list');
 * t('time', 'Time');
 * t('toggleCollapseOrExpand', 'Toggle collapse or expand');
 * t('tryAgainMessage', 'Try opening another form from');
 * t('unspecified', 'Unspecified');
 * t('upload', 'Upload');
 * t('uploadImage', 'Upload image');
 * t('uploadedPhoto', 'Uploaded photo');
 * t('valuesOutOfBound', 'Some of the values are out of bounds');
 */
