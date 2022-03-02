import React, { useState } from 'react';
import { Tag } from 'carbon-components-react';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import { PatientProgram } from '../hooks/usePatientProgramEnrollment';
import BaseVisitType from './base-visit-type.component';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface RecommendedVisitTypeProp {
  patientUuid: string;
  activePatientEnrollment: Array<PatientProgram>;
  onChange: (visitTypeUuid) => void;
  locationUuid: string;
}

const RecommendedVisitType: React.FC<RecommendedVisitTypeProp> = ({
  patientUuid,
  activePatientEnrollment,
  onChange,
  locationUuid,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { recommendedVisitTypes, error } = useRecommendedVisitTypes(
    patientUuid,
    selectedProgram?.uuid,
    selectedProgram?.program?.uuid,
    locationUuid,
  );

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {activePatientEnrollment.length === 0 && (
        <EmptyState
          headerTitle="Enroll patient to program"
          displayText="patient enrollment"
          launchForm={() => launchPatientWorkspace('programs-form-workspace')}
        />
      )}
      {activePatientEnrollment.map((enrollment) => (
        <Tag
          onClick={(e) => {
            setSelectedProgram(enrollment);
            e.preventDefault();
          }}
          type={selectedProgram?.uuid === enrollment.uuid ? 'blue' : 'cool-gray'}
          key={enrollment.uuid}
        >
          {enrollment.program['name']}
        </Tag>
      ))}
      {recommendedVisitTypes?.length > 0 && (
        <BaseVisitType onChange={onChange} visitTypes={recommendedVisitTypes} patientUuid={patientUuid} />
      )}
    </div>
  );
};

export default RecommendedVisitType;
