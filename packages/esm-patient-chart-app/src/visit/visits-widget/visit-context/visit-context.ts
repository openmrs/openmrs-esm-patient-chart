import { getVisitStore, useStoreWithActions, type Visit } from '@openmrs/esm-framework';

export function useVisitContextStore() {
  return useStoreWithActions(getVisitStore(), {
    setVisitContext(_, newSelectedVisit: Visit) {
      return {
        manuallySetVisitUuid: newSelectedVisit.uuid,
        patientUuid: newSelectedVisit.patient.uuid,
      };
    },
  });
}
