import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useCallback, useMemo } from 'react';

export function useLaunchOrderBasket(patientUuid) {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(
    () => ({
      launchOrderBasket: () => {
        if (currentVisit) {
          launchPatientWorkspace('order-basket-workspace');
        } else {
          launchStartVisitPrompt();
        }
      },
    }),
    [currentVisit],
  );
  return results;
}
