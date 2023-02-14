import { Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { launchFormEntry } from './vitals-overview.component';

export function launchVitalsForm(currentVisit: Visit, config: ConfigObject) {
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
