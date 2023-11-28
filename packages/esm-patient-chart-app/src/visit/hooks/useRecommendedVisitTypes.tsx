import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig } from '../../config-schema';

interface EnrollmentVisitType {
  dataDependencies: Array<string>;
  enrollmentOptions: object;
  incompatibleWith: Array<string>;
  name: string;
  visitTypes: { allowed: Array<EnrollmentVisitType>; disallowed: Array<EnrollmentVisitType> };
}

export const useRecommendedVisitTypes = (
  patientUuid: string,
  enrollmentUuid: string,
  programUuid: string,
  locationUuid: string,
) => {
  const { visitTypeResourceUrl, showRecommendedVisitTypeTab } = useConfig() as ChartConfig;
  const url = `${visitTypeResourceUrl}${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`;

  const { data, error, isLoading } = useSWR<{ data: EnrollmentVisitType }>(
    showRecommendedVisitTypeTab && patientUuid && enrollmentUuid && programUuid ? url : null,
    openmrsFetch,
  );

  const recommendedVisitTypes = useMemo(() => data?.data?.visitTypes?.allowed.map(mapToVisitType) ?? [], [data]);
  return { recommendedVisitTypes, error, isLoading };
};

const mapToVisitType = (visitType) => {
  return { ...visitType, display: visitType.name };
};
