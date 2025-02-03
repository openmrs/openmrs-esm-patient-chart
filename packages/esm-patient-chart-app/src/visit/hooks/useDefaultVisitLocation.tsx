import { type FetchResponse, type Location, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useEffect } from 'react';
import useSWR from 'swr';

/**
 * Fetches the default visit location based on the location and the restrictByVisitLocationTag
 * If restrictByVisitLocationTag is true, it fetches the nearest ancestor location that supports visits, otherwise it returns the passed-in location
 *
 * @param location
 * @param restrictByVisitLocationTag
 */
export function useDefaultVisitLocation(location: Location, restrictByVisitLocationTag: boolean) {
  let url = `${restBaseUrl}/emrapi/locationThatSupportsVisits?location=${location?.uuid}`;

  const { data, error } = useSWR<FetchResponse>(restrictByVisitLocationTag ? url : null, openmrsFetch);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return !restrictByVisitLocationTag ? location : data?.data;
}
