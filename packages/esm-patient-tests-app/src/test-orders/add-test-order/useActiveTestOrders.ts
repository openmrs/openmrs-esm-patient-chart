import { useMemo } from 'react';
import { usePatientOrders } from '@openmrs/esm-patient-common-lib';

/**
 * Returns the concept UUIDs of the patient's active orders of the given order type, so the
 * test type search can flag a test that is already ordered. The order type and the stopped
 * date are also checked here because the backend ignores search parameters it does not support.
 */
export function useActiveTestOrders(patientUuid: string, orderTypeUuid: string) {
  const { data: orders, isLoading, error } = usePatientOrders(patientUuid, 'ACTIVE', orderTypeUuid);

  const activeTestConceptUuids = useMemo(
    () =>
      new Set(
        (orders ?? [])
          .filter(
            (order) => order?.orderType?.uuid === orderTypeUuid && order.action !== 'DISCONTINUE' && !order.dateStopped,
          )
          .map((order) => order?.concept?.uuid)
          .filter(Boolean),
      ),
    [orders, orderTypeUuid],
  );

  return { activeTestConceptUuids, isLoading, error };
}
