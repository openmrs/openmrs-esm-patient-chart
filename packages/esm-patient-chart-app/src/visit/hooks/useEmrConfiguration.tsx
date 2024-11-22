import { type FetchResponse, openmrsFetch, type OpenmrsResource, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { useMemo } from 'react';

interface EmrApiConfigurationResponse {
  atFacilityVisitType: OpenmrsResource;
  // TODO: extract this into Core and include all fields (see Ward app)
}

const customRepProps = [['atFacilityVisitType', 'ref']];

const customRep = `custom:${customRepProps.map((prop) => prop.join(':')).join(',')}`;

export function useEmrConfiguration(isEmrApiModuleInstalled: boolean) {
  const url = isEmrApiModuleInstalled ? `${restBaseUrl}/emrapi/configuration?v=${customRep}` : null;

  const swrData = useSWRImmutable<FetchResponse<EmrApiConfigurationResponse>>(url, openmrsFetch);

  const results = useMemo(
    () => ({
      emrConfiguration: swrData.data?.data,
      isLoadingEmrConfiguration: swrData.isLoading,
      mutateEmrConfiguration: swrData.mutate,
      errorFetchingEmrConfiguration: swrData.error,
    }),
    [swrData],
  );
  return results;
}
