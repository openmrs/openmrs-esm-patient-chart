import { OpenmrsResource, navigate } from '@openmrs/esm-framework';
import type { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';
import isEmpty from 'lodash-es/isEmpty';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

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
    if (isEmpty(htmlForm)) {
      launchFormEntry(
        formUuid,
        patientUuid,
        encounterUuid,
        formName,
        visitUuid,
        visitTypeUuid,
        visitStartDatetime,
        visitStopDatetime,
        mutateForms,
      );
    } else {
      if (encounterUuid) {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formEditUiPage}.page?patientId=${patientUuid}&visitId=${visitUuid}&encounterId=${encounterUuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
        });
      } else {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patientUuid}&visitId=${visitUuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
        });
      }
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
    },
  });
}
