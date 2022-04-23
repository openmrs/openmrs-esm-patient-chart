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
) {
  if (currentVisit) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);
    if (isEmpty(htmlForm)) {
      launchFormEntry(formUuid, patient.id, encounterUuid, formName);
    } else {
      navigate({
        to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patient.id}&visitId=${currentVisit.uuid}&definitionUiResource=${htmlForm.formUiResource}`,
      });
    }
  } else {
    launchStartVisitPrompt();
  }
}

export function launchFormEntry(formUuid: string, patientUuid: string, encounterUuid?: string, formName?: string) {
  formEntrySub.next({ formUuid, encounterUuid });
  launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName });
  navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
}
