import { Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';

export function launchFormEntry(formUuid: string, encounterUuid?: string, formName?: string) {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: formName,
    formInfo: { formUuid, encounterUuid },
  });
}

export function launchVitalsAndBiometricsForm(currentVisit: Visit, config: ConfigObject) {
  if (currentVisit && config.vitals.useFormEngine) {
    launchFormEntry(config.vitals.formUuid, '', config.vitals.formName);
  }
  if (currentVisit) {
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace);
  }
  if (!currentVisit) {
    launchStartVisitPrompt();
  }
}
