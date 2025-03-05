import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';

export function useInfiniteVisits(patientUuid: string) {
  const getKey = useInfiniteVisitsGetKey(patientUuid);

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: localMutate,
    size,
    setSize,
  } = useSWRInfinite(patientUuid ? getKey : null, openmrsFetch, { parallel: true });

  return {
    visits: data ? [].concat(data?.flatMap((page) => page?.data?.results)) : null,
    error,
    hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
    isLoading,
    isValidating,
    mutateVisits: localMutate,
    setSize,
    size,
  };
}

export function useInfiniteVisitsGetKey(patientUuid: string) {
  const { numberOfVisitsToLoad } = useConfig({ externalModuleName: '@openmrs/esm-patient-chart-app' });
  const customRepresentation =
    'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

  return () => {
    const getKey = (pageIndex, previousPageData) => {
      const pageSize = numberOfVisitsToLoad;

      if (previousPageData && !previousPageData?.data?.links.some((link) => link.rel === 'next')) {
        return null;
      }

      let url = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}&limit=${pageSize}`;

      if (pageIndex) {
        url += `&startIndex=${pageIndex * pageSize}`;
      }

      return url;
    };

    return getKey;
  };
}
