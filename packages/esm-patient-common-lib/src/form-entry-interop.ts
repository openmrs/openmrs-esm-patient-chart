import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

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
) {
  if (visitUuid) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);

    if (htmlForm) {
      launchHtmlFormEntry(formName, encounterUuid, visitUuid, htmlForm);
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
) {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: formName,
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

export function launchHtmlFormEntry(formName, encounterUuid, visitUuid, htmlForm) {
  launchPatientWorkspace('patient-html-form-entry-workspace', {
    workspaceTitle: formName,
    formInfo: {
      encounterUuid,
      visitUuid,
      htmlForm,
    },
  });
}
