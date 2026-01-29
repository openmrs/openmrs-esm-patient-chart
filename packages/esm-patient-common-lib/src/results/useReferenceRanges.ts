import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import { type ReferenceRanges } from '../types';

interface ReferenceRangeResponse {
  uuid: string;
  concept: string;
  lowNormal?: number;
  hiNormal?: number;
  lowAbsolute?: number;
  hiAbsolute?: number;
  lowCritical?: number;
  hiCritical?: number;
}

export interface UseReferenceRangesResult {
  ranges: Map<string, ReferenceRanges>;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Fetches patient-specific reference ranges for given concepts.
 * Uses the /conceptreferencerange REST API endpoint.
 *
 * @param patientUuid - The UUID of the patient
 * @param conceptUuids - Array of concept UUIDs to fetch ranges for
 * @returns Object containing ranges map, loading state, error, and mutate function
 */
export function useReferenceRanges(patientUuid: string, conceptUuids: Array<string>): UseReferenceRangesResult {
  const conceptList = conceptUuids.filter(Boolean).join(',');
  const apiUrl =
    patientUuid && conceptList
      ? `${restBaseUrl}/conceptreferencerange?patient=${patientUuid}&concept=${conceptList}&v=full`
      : null;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<ReferenceRangeResponse> }>, Error>(
    apiUrl,
    openmrsFetch,
  );

  const rangesMap = useMemo(() => {
    const map = new Map<string, ReferenceRanges>();
    data?.data?.results?.forEach((range) => {
      if (range.concept) {
        map.set(range.concept, {
          lowNormal: range.lowNormal,
          hiNormal: range.hiNormal,
          lowAbsolute: range.lowAbsolute,
          hiAbsolute: range.hiAbsolute,
          lowCritical: range.lowCritical,
          hiCritical: range.hiCritical,
        });
      }
    });
    return map;
  }, [data]);

  return {
    ranges: rangesMap,
    isLoading,
    error,
    mutate,
  };
}
