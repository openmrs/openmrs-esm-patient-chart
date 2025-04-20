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

export const emptyFormModal = getAsyncLifecycle(() => import('./form-renderer/repeat/empty-form.modal'), options);

/**
 * DO NOT REMOVE THIS COMMENT
 * THE TRANSLATION KEYS AND VALUES USED IN THE FORM ENGINE LIB ARE WRITTEN HERE
 * t("add", "Add")
 * t("addCameraImage", "Add camera image")
 * t("addFile", "Add files")
 * t("alreadyDiscontinuedDescription", "This patient is already enrolled in the selected program and has already been discontinued.")
 * t("alreadyEnrolledDescription", "This patient is already enrolled in the selected program and cannot be enrolled again.")
 * t("attachmentsSaved", "Attachment(s) saved successfully")
 * t("blank", "Blank")
 * t("cameraCapture", "Camera capture")
 * t("cancel", "Cancel")
 * t("cannotDiscontinueEnrollment", "Cannot discontinue an enrollment that does not exist")
 * t("chooseAnOption", "Choose an option")
 * t("clearFile", "Clear file")
 * t("close", "Close")
 * t("closeCamera", "Close camera")
 * t("closesNotification", "Closes notification")
 * t("diagnosisSaved", "Diagnosis(es) saved successfully")
 * t("enrolledToProgram", "The patient has been successfully enrolled in the program.")
 * t("enrollmentAlreadyDiscontinued", "Enrollment already discontinued")
 * t("enrollmentDiscontinuationNotAllowed", "Enrollment discontinuation not allowed")
 * t("enrollmentDiscontinued", "The patient's program enrollment has been successfully discontinued.")
 * t("enrollmentNotAllowed", "Enrollment not allowed")
 * t("errorDescription", "{{errors}}")
 * t("errorDescriptionTitle", "")
 * t("errorLoadingFormSchema", "Error loading form schema")
 * t("errorLoadingInitialValues", "Error loading initial values")
 * t("errorRenderingField", "Error rendering field")
 * t("errorSavingAttachments", "Error saving attachment(s)")
 * t("errorSavingEncounter", "Error saving encounter")
 * t("errorSavingEnrollment", "Error saving enrollment")
 * t("errorSavingPatientIdentifiers", "Error saving patient identifiers")
 * t("errorSavingPatientPrograms", "Error saving patient program(s)")
 * t("fieldErrorDescriptionTitle", "Validation Errors")
 * t("fileUploadDescription", "Upload one of the following file types: {{fileTypes}}")
 * t("fileUploadDescriptionAny", "Upload any file type")
 * t("invalidWorkspaceName", "Invalid workspace name.")
 * t("invalidWorkspaceNameSubtitle", "Please provide a valid workspace name.")
 * t("launchWorkspace", "Launch Workspace")
 * t("loading", "Loading")
 * t("notification", "Notification")
 * t("nullMandatoryField", "Please fill the required fields")
 * t("ordersSaved", "Order(s) saved successfully")
 * t("patientIdentifiersSaved", "Patient identifier(s) saved successfully")
 * t("patientProgramsSaved", "Patient program(s) saved successfully")
 * t("preview", "Preview")
 * t("previousValue", "Previous value:")
 * t("remove", "Remove")
 * t("required", "Required")
 * t("reuseValue", "Reuse value")
 * t("save", "Save")
 * t("search", "Search")
 * t("searching", "Searching")
 * t("submitting", "Submitting")
 * t("time", "Time")
 * t("unspecified", "Unspecified")
 * t("upload", "Upload")
 * t("uploadedPhoto", "Uploaded photo")
 * t("uploadImage", "Upload image")
 * t("valuesOutOfBound", "Some of the values are out of bounds")
 */
