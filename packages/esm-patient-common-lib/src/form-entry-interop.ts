import { type Form, type HtmlFormEntryForm, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

import { launchWorkspace } from '@openmrs/esm-framework';

export const clinicalFormsWorkspace = 'clinical-forms-workspace';
export const formEntryWorkspace = 'patient-form-entry-workspace';
export const htmlFormEntryWorkspace = 'patient-html-form-entry-workspace';

const formEngineResourceName = 'formEngine';
const htmlformentryFormEngine = 'htmlformentry';
const uiStyleResourceName = 'uiStyle';
const uiStyleSimple = 'simple';

export function launchFormEntryOrHtmlForms(
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  patientUuid: string,
  form: Form,
  visitUuid?: string,
  encounterUuid?: string,
  visitTypeUuid?: string,
  visitStartDatetime?: string,
  visitStopDatetime?: string,
  mutateForms?: () => void,
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
  formEntryWorkspaceName = formEntryWorkspace,
  htmlFormEntryWorkspaceName = htmlFormEntryWorkspace,
) {
  if (visitUuid) {
    const { uuid: formUuid, display, name } = form ?? {};
    const formName = display ?? name ?? '--';

    const htmlForm = toHtmlForm(form, htmlFormEntryForms);
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
  launchWorkspace(formEntryWorkspaceName, {
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
  launchWorkspace(workspaceName, {
    workspaceTitle: formName,
    patientUuid,
    formInfo: {
      encounterUuid,
      visitUuid,
      htmlForm,
    },
  });
}

/**
 * For a given form , check if it is an HTML form. If it is, return the HtmlFormEntryForm object,
 * otherwise return null
 * @param form
 * @param htmlFormEntryForms A list of HTML forms configured in @esm-patient-forms-app's config
 *
 * @returns
 */
function toHtmlForm(form: Form, htmlFormEntryForms: Array<HtmlFormEntryForm>): HtmlFormEntryForm {
  const isHtmlForm =
    htmlFormEntryForms?.some((hfeForm) => hfeForm.formUuid === form.uuid) ||
    form.resources?.some((resource) => {
      return resource.name === formEngineResourceName && resource.valueReference === htmlformentryFormEngine;
    });
  if (isHtmlForm) {
    const hfeForm = htmlFormEntryForms?.find((f) => f.formUuid === form.uuid);
    const simple = form.resources?.some((r) => r.name === uiStyleResourceName && r.valueReference === uiStyleSimple);

    return {
      formUuid: form.uuid,
      formName: hfeForm?.formName ?? form.display ?? form.name,
      formUiResource: hfeForm?.formUiResource,
      formUiPage: hfeForm?.formUiPage ?? (simple ? 'enterHtmlFormWithSimpleUi' : 'enterHtmlFormWithStandardUi'),
      formEditUiPage: hfeForm?.formEditUiPage ?? (simple ? 'editHtmlFormWithSimpleUi' : 'editHtmlFormWithStandardUi'),
    };
  } else {
    return null;
  }
}

/**
 * Given a list of forms and a list of HtmlFormEntryForm objects from configuration, return a List of HtmlFormEntryForm
 * returned forms either
 *  a) have a form resource with a name of `formEngine` and a value of `htmlformentry, or
 *  b) have an entry in the HtmlFormEntryForm array for a given form uuid
 * The HtmlFormEntryForm configuration provides a means to override the name and rendering mode of a given form
 * @param allForms
 * @param htmlFormEntryForms
 */
export function mapFormsToHtmlFormEntryForms(
  allForms: Array<Form>,
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
): Array<HtmlFormEntryForm> {
  return allForms?.map((form) => toHtmlForm(form, htmlFormEntryForms))?.filter((form) => form !== null);
}
