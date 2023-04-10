import { Visit } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { launchFormEntry } from './vitals-overview.component';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

/**
 * Launches the appropriate workspace based on the current visit and configuration.
 * @param currentVisit - The current visit.
 * @param config - The configuration object.
 */
export function launchVitalsForm(currentVisit: Visit, config: ConfigObject) {
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
