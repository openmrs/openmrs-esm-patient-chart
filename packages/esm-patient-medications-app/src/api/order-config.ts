import { openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

export interface CommonConfigProps {
  uuid: string;
  display: string;
}

export interface OrderConfig {
  drugRoutes: Array<CommonConfigProps>;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  durationUnits: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
  quantityUnits: Array<CommonConfigProps>;
}

export function useOrderConfig() {
  const { data, error, isValidating } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `/ws/rest/v1/orderentryconfig`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      orderConfigObject: {
        drugRoutes: data?.data?.drugRoutes,
        drugDosingUnits: data?.data?.drugDosingUnits,
        drugDispensingUnits: data?.data?.drugDispensingUnits,
        durationUnits: data?.data?.durationUnits,
        orderFrequencies: data?.data?.orderFrequencies,
        quantityUnits: data?.data?.quantityUnits,
      },
      isLoading: !data && !error,
      error,
    }),
    [data, error],
  );

  return results;
}
