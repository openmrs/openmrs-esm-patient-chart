import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ChartConfig } from '../../config-schema';

export const useRecommendedVisitTypes = (
  patientUuid: string,
  enrollmentUuid: string,
  programUuid: string,
  locationUuid: string,
) => {
  const config = useConfig() as ChartConfig;
  const { data, error } = useSWR<{ data: any }>(
    patientUuid &&
      enrollmentUuid &&
      programUuid &&
      `${config.visitTypeResourceUrl}${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`,
    openmrsFetch,
  );
  const recommendedVisitTypes = data?.data?.visitTypes?.allowed.map(mapToVisitType) ?? [];
  return { recommendedVisitTypes, error, isLoading: !recommendedVisitTypes && !error };
};

const mapToVisitType = (visitType) => {
  return { ...visitType, display: visitType.name };
};
