import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useMemo } from 'react';
import { useSystemVisitSetting } from '../api/api';

export function useLaunchOrderBasket(patientUuid) {
  const { systemVisitEnabled } = useSystemVisitSetting();

  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(
    () => ({
      launchOrderBasket: () => {
        if (!systemVisitEnabled || currentVisit) {
          launchPatientWorkspace('order-basket-workspace');
        } else {
          launchStartVisitPrompt();
        }
      },
    }),
    [currentVisit, systemVisitEnabled],
  );
  return results;
}
