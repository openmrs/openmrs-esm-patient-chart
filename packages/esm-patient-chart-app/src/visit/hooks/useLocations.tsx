import { type FetchResponse, type Location, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useEffect } from 'react';
import useSWR from 'swr';

export function useLocations(searchString?: string) {
  let url = `${restBaseUrl}/location`;

  if (searchString) {
    url += `?q=${searchString}`;
  }
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<Location> }>>(url, openmrsFetch);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return {
    locations: data?.data?.results?.map(({ display, uuid }) => ({
      display,
      uuid,
    })),
    isLoading,
    error,
  };
}
