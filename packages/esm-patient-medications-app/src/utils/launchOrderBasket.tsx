import { useConfig } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useMemo } from 'react';
import { ConfigObject } from '../config-schema';

export function useLaunchOrderBasket(patientUuid) {
  const config = useConfig() as ConfigObject;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(
    () => ({
      launchOrderBasket: () => {
        if (!config?.mapOrderEncounterToCurrentVisit || currentVisit) {
          launchPatientWorkspace('order-basket-workspace');
        } else {
          launchStartVisitPrompt();
        }
      },
    }),
    [currentVisit, config?.mapOrderEncounterToCurrentVisit],
  );
  return results;
}
