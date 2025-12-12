import { type HtmlFormEntryForm } from '@openmrs/esm-patient-common-lib';
import { type Form } from '../types';

const formEngineResourceName = 'formEngine';
const htmlformentryFormEngine = 'htmlformentry';
const uiStyleResourceName = 'uiStyle';
const uiStyleSimple = 'simple';

/**
 * For a given form , check if it is an HTML form. If it is, return the HtmlFormEntryForm object,
 * otherwise return null
 * @param form
 * @param htmlFormEntryForms A list of HTML forms configured in @esm-patient-forms-app's config
 *
 * @returns
 */
export function toHtmlForm(form: Form, htmlFormEntryForms: Array<HtmlFormEntryForm>): HtmlFormEntryForm {
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
