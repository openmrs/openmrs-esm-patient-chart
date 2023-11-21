import { navigate } from '@openmrs/esm-framework';
import type { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';
import type { MappedEncounter } from './visit/visits-widget/visit.resource';
import isEmpty from 'lodash-es/isEmpty';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

export function launchFormEntryOrHtmlForms(
  encounter: MappedEncounter | undefined,
  patient: string,
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  mutateForms?: () => void,
) {
  if (encounter) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === encounter?.form?.uuid);
    if (isEmpty(htmlForm)) {
      launchFormEntry(
        encounter?.form?.uuid,
        patient,
        encounter.id,
        encounter.form.display,
        encounter.visitUuid,
        encounter.visitTypeUuid,
        mutateForms,
      );
    } else {
      if (encounter?.id) {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/editHtmlFormWithStandardUi.page?patientId=${patient}&visitId=${encounter.visitUuid}&encounterId=${encounter?.id}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
        });
      } else {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patient}&visitId=${encounter.visitUuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
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
    },
  });
}
