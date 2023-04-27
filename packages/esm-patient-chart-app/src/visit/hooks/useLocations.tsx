import { FetchResponse, Location, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useLocations(searchString?: string) {
  let url = '/ws/rest/v1/locaion';

  if (searchString) {
    url += `?q=${searchString}`;
  }
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<Location> }>>(url, openmrsFetch);

  return {
    locations: data?.data?.results?.map(({ display, uuid }) => ({
      display,
      uuid,
    })),
    isLoading,
    error,
  };
}
