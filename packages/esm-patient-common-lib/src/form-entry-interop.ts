import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

export const clinicalFormsWorkspace = 'clinical-forms-workspace';
export const formEntryWorkspace = 'patient-form-entry-workspace';
export const htmlFormEntryWorkspace = 'patient-html-form-entry-workspace';

interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
  formEditUiPage: 'editHtmlFormWithSimpleUi' | 'editHtmlFormWithStandardUi';
}

export function launchFormEntryOrHtmlForms(
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  patientUuid: string,
  formUuid: string,
  visitUuid?: string,
  encounterUuid?: string,
  formName?: string,
  visitTypeUuid?: string,
  visitStartDatetime?: string,
  visitStopDatetime?: string,
  mutateForms?: () => void,
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
  formEntryWorkspaceName = formEntryWorkspace,
  htmlFormEntryWorkspaceName = htmlFormEntryWorkspace,
) {
  if (visitUuid) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);

    if (htmlForm) {
      launchHtmlFormEntry(patientUuid, formName, encounterUuid, visitUuid, htmlForm, htmlFormEntryWorkspaceName);
    } else {
      launchFormEntry(
        formUuid,
        patientUuid,
        encounterUuid,
        formName,
        visitUuid,
        visitTypeUuid,
        visitStartDatetime,
        visitStopDatetime,
        htmlForm,
        mutateForms,
        clinicalFormsWorkspaceName,
        formEntryWorkspaceName,
      );
    }
  } else {
    launchStartVisitPrompt();
  }
}

export function launchFormEntry(
  formUuid: string,
  patientUuid: string,
  encounterUuid?: string,
  formName?: string,
  visitUuid?: string,
  visitTypeUuid?: string,
  visitStartDatetime?: string,
  visitStopDatetime?: string,
  htmlForm?: HtmlFormEntryForm,
  mutateForm?: () => void,
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
  formEntryWorkspaceName = formEntryWorkspace,
) {
  launchPatientWorkspace(formEntryWorkspaceName, {
    workspaceTitle: formName,
    clinicalFormsWorkspaceName,
    formEntryWorkspaceName,
    patientUuid,
    mutateForm,
    formInfo: {
      encounterUuid,
      formUuid,
      patientUuid,
      visitTypeUuid: visitTypeUuid,
      visitUuid: visitUuid,
      visitStartDatetime,
      visitStopDatetime,
      htmlForm,
    },
  });
}

export function launchHtmlFormEntry(
  patientUuid: string,
  formName: string,
  encounterUuid: string,
  visitUuid: string,
  htmlForm: HtmlFormEntryForm,
  workspaceName = htmlFormEntryWorkspace,
) {
  launchPatientWorkspace(workspaceName, {
    workspaceTitle: formName,
    patientUuid,
    formInfo: {
      encounterUuid,
      visitUuid,
      htmlForm,
    },
  });
}
