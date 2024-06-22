import { openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

interface CauseOfDeathResponse {
  data: {
    causeOfDeath: {
      display: string;
    };
  };
}

export function useCauseOfDeath(patientUuid: string) {
  const customRepresentation = 'custom:(causeOfDeath:(display)';
  const url = `/ws/rest/v1/person/${patientUuid}?v=${customRepresentation}`;

  const { data, error } = useSWR<CauseOfDeathResponse, Error>(patientUuid ? url : null, openmrsFetch);

  const results = useMemo(
    () => ({
      causeOfDeath: data?.data?.causeOfDeath?.display,
      error,
    }),
    [data?.data?.causeOfDeath, error],
  );

  return results;
}
