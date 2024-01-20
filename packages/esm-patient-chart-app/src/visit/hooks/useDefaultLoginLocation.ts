import { type FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type ChartConfig } from '../../config-schema';

export const useDefaultLoginLocation = () => {
  const config = useConfig() as ChartConfig;
  const apiUrl = config.defaultFacilityUrl;
  const { data, error, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    defaultLoginLocation: data ? data?.data : null,
    isLoadingDefaultLoginLocation: isLoading,
    error,
  };
};
