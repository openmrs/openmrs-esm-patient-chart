import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useCallback, useMemo } from 'react';

export function useLaunchOrderBasket(patientUuid) {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchOrderBasket = useCallback(() => {
    if (currentVisit) {
      launchPatientWorkspace('order-basket-workspace');
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit]);

  const results = useMemo(() => ({ launchOrderBasket }), [launchOrderBasket]);
  return results;
}
