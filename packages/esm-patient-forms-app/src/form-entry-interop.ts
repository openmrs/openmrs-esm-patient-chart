import { navigate, Visit } from '@openmrs/esm-framework';
import { HtmlFormEntryForm } from './config-schema';
import isEmpty from 'lodash-es/isEmpty';
import { formEntrySub, launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

export function launchFormEntryOrHtmlForms(
  currentVisit: Visit | undefined,
  formUuid: string,
  patient: fhir.Patient,
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  encounterUuid?: string,
  formName?: string,
  mutateForms?: () => void,
  form?: object,
  showOHRIFormEngine?: boolean,
) {
  if (currentVisit) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);
    if (isEmpty(htmlForm)) {
      launchFormEntry(formUuid, patient.id, encounterUuid, formName, mutateForms, form, showOHRIFormEngine);
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
  form?: object,
  showOHRIFormEngine?: boolean,
) {
  formEntrySub.next({ formUuid, encounterUuid });
  showOHRIFormEngine
    ? launchOHRIPatientWorkspace(formName, mutateForm, form)
    : launchAmpathPatientWorkspace(formName, mutateForm);
}

const launchAmpathPatientWorkspace = (formName, mutateForm) => {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: formName,
    mutateForm,
  });
};
const launchOHRIPatientWorkspace = (formName, mutateForm, form) => {
  launchPatientWorkspace('patient-ohri-form-workspace', {
    workspaceTitle: formName,
    mutateForm,
    completedFormInfo: form,
  });
};
