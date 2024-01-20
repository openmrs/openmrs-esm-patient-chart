import { useEffect } from 'react';
import { type FetchResponse, type Location, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useLocations(searchString?: string) {
  let url = '/ws/rest/v1/location';

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
