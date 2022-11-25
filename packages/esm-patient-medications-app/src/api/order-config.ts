import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

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
}

export function useOrderConfig() {
  const { data, error, isValidating } = useSWR<{ data: OrderConfig }, Error>(
    `/ws/rest/v1/orderentryconfig`,
    openmrsFetch,
  );
  return {
    orderConfigObject: data ? data.data : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
