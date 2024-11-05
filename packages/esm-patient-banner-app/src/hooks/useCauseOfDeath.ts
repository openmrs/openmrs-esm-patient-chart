import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface CauseOfDeathResponse {
  data: {
    causeOfDeath: {
      display: string;
    };
    causeOfDeathNonCoded?: string;
  };
}

export function useCauseOfDeath(patientUuid: string) {
  const customRepresentation = 'custom:(causeOfDeath:(display),causeOfDeathNonCoded)';
  const url = `${restBaseUrl}/person/${patientUuid}?v=${customRepresentation}`;

  const { data, error } = useSWR<CauseOfDeathResponse, Error>(patientUuid ? url : null, openmrsFetch);

  const results = useMemo(
    () => ({
      causeOfDeath: data?.data?.causeOfDeath?.display,
      nonCodedCauseOfDeath: data?.data?.causeOfDeathNonCoded,
      error,
    }),
    [data?.data?.causeOfDeath?.display, data?.data?.causeOfDeathNonCoded, error],
  );

  return results;
}
