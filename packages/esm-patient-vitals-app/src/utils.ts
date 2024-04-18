import { type Visit } from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from './config-schema';
import { patientVitalsBiometricsFormWorkspace } from './constants';

/**
 * Launches the for entry workspace with the custom form
 *
 * @param formUuid The form to use
 * @param encounterUuid The current encounter, if any
 * @param formName The name of the form to use
 */
export function launchFormEntry(formUuid: string, encounterUuid?: string, formName?: string) {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: formName,
    formInfo: { formUuid, encounterUuid },
  });
}

/**
 * Launches the appropriate workspace based on the current visit and configuration.
 * @param currentVisit - The current visit.
 * @param config - The configuration object.
 */
export function launchVitalsAndBiometricsForm(currentVisit: Visit, config: ConfigObject) {
  if (!currentVisit) {
    launchStartVisitPrompt();
    return;
  }

  if (config.vitals.useFormEngine) {
    const { formUuid, formName } = config.vitals;
    launchFormEntry(formUuid, '', formName);
  } else {
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace);
  }
}
