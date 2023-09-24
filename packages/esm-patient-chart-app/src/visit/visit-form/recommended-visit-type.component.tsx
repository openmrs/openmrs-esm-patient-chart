import React from 'react';
import { StructuredListSkeleton } from '@carbon/react';
import { PatientProgram } from '@openmrs/esm-patient-common-lib';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import BaseVisitType from './base-visit-type.component';

interface RecommendedVisitTypeProp {
  patientUuid: string;
  patientProgramEnrollment: PatientProgram;
  locationUuid: string;
}

const RecommendedVisitType: React.FC<RecommendedVisitTypeProp> = ({
  patientUuid,
  patientProgramEnrollment,
  locationUuid,
}) => {
  const { recommendedVisitTypes, error, isLoading } = useRecommendedVisitTypes(
    patientUuid,
    patientProgramEnrollment?.uuid,
    patientProgramEnrollment?.program?.uuid,
    locationUuid,
  );

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {isLoading ? <StructuredListSkeleton /> : <BaseVisitType visitTypes={recommendedVisitTypes} />}
    </div>
  );
};

export const MemoizedRecommendedVisitType = React.memo(RecommendedVisitType);
