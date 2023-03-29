import { useMemo } from 'react';
import { usePatient } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';

function useLaunchFormsWorkspace() {
  const { patientUuid } = usePatient();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(
    () => ({
      launchFormsWorkspace: () => {
        if (currentVisit) {
          launchPatientWorkspace('clinical-forms-workspace');
        } else {
          launchStartVisitPrompt();
        }
      },
    }),
    [currentVisit],
  );

  return results;
}

export default useLaunchFormsWorkspace;
