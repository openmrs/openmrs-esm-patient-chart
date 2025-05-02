import { navigate, type Visit } from '@openmrs/esm-framework';
import {
  type HtmlFormEntryForm,
  launchPatientWorkspace,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import { isEmpty } from 'lodash-es';
import type { Form } from './types';
import { formEngineResourceName, htmlformentryFormEngine, uiStyleResourceName, uiStyleSimple } from './constants';

export function launchFormEntryOrHtmlForms(
  currentVisit: Visit | undefined,
  formUuid: string,
  patient: fhir.Patient,
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  encounterUuid?: string,
  formName?: string,
  mutateForms?: () => void,
) {
  if (currentVisit) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);
    if (isEmpty(htmlForm)) {
      launchFormEntry(formUuid, patient.id, encounterUuid, formName, mutateForms, currentVisit);
    } else {
      navigate({
        to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patient.id}&visitId=${currentVisit.uuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
      });
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
  mutateForm?: () => void,
  currentVisit?: Visit,
) {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: formName,
    mutateForm,
    formInfo: { encounterUuid, formUuid, visit: currentVisit },
  });
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
export function mapFormsToHtmlFormEntryForms(allForms: Array<Form>, htmlFormEntryForms: HtmlFormEntryForm[]) {
  return allForms
    ?.filter((form) => {
      return (
        htmlFormEntryForms?.some((hfeForm) => hfeForm.formUuid === form.uuid) ||
        form.resources?.some((resource) => {
          return resource.name === formEngineResourceName && resource.valueReference === htmlformentryFormEngine;
        })
      );
    })
    ?.map((form) => {
      const hfeForm = htmlFormEntryForms?.find((f) => f.formUuid === form.uuid);
      const simple = form.resources?.some((r) => r.name === uiStyleResourceName && r.valueReference === uiStyleSimple);
      return {
        formUuid: form.uuid,
        formName: hfeForm?.formName ?? form.display ?? form.name,
        formUiResource: hfeForm?.formUiResource,
        formUiPage: hfeForm?.formUiPage ?? simple ? 'enterHtmlFormWithSimpleUi' : 'enterHtmlFormWithStandardUi',
        formEditUiPage: hfeForm?.formEditUiPage ?? simple ? 'editHtmlFormWithSimpleUi' : 'editHtmlFormWithStandardUi',
      } as HtmlFormEntryForm;
    });
}
