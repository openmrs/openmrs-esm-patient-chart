import { navigate, type Visit } from '@openmrs/esm-framework';
import {
  type HtmlFormEntryForm,
  launchPatientWorkspace,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import { isEmpty } from 'lodash-es';

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
