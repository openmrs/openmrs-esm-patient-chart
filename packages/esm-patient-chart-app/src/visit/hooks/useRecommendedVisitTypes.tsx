import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export const useRecommendedVisitTypes = (
  patientUuid: string,
  enrollmentUuid: string,
  programUuid: string,
  locationUuid: string,
) => {
  const { data, error } = useSWR<{ data: any }>(
    patientUuid &&
      enrollmentUuid &&
      programUuid &&
      `/etl-latest/etl/patient/${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`,
    openmrsFetch,
  );
  const recommendedVisitTypes = data?.data?.visitTypes?.allowed.map(mapToVisitType) ?? [];
  return { recommendedVisitTypes, error, isLoading: !recommendedVisitTypes && !error };
};

const mapToVisitType = (visitType) => {
  return { ...visitType, display: visitType.name };
};
