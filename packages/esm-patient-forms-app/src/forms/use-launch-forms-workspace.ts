import { useMemo } from 'react';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
  useBills,
  launchPayBillPrompt,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

function useLaunchFormsWorkspace() {
  const { patientUuid } = usePatient();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { data } = useBills(patientUuid);
  const config = useConfig() as ConfigObject;
  const showBillingDialog = config.showBillingDialog;

  const results = useMemo(
    () => ({
      launchFormsWorkspace: () => {
        if (currentVisit) {
          launchPatientWorkspace('clinical-forms-workspace');
        } else if (showBillingDialog && data?.length > 0) {
          launchPayBillPrompt();
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
