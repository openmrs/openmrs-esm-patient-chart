import React, { useEffect, useState } from 'react';
import { Tag } from 'carbon-components-react';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import BaseVisitType from './base-visit-type.component';
import { EmptyState, launchPatientWorkspace, PatientProgram } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

interface RecommendedVisitTypeProp {
  patientUuid: string;
  activePatientEnrollment: Array<PatientProgram>;
  onChange: (visitTypeUuid) => void;
  locationUuid: string;
  onProgramUuidChange: (uuid) => void;
}

const RecommendedVisitType: React.FC<RecommendedVisitTypeProp> = ({
  patientUuid,
  activePatientEnrollment,
  onChange,
  locationUuid,
  onProgramUuidChange,
}) => {
  const { t } = useTranslation();
  const [selectedProgram, setSelectedProgram] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { recommendedVisitTypes, error } = useRecommendedVisitTypes(
    patientUuid,
    selectedProgram?.uuid,
    selectedProgram?.program?.uuid,
    locationUuid,
  );

  useEffect(() => {
    onProgramUuidChange(selectedProgram.program.uuid);
  }, []);

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {activePatientEnrollment.length === 0 && (
        <EmptyState
          headerTitle={t('enrollToProgram', 'Enroll patient to program')}
          displayText={t('patientEnrollment', 'patient enrollment')}
          launchForm={() => launchPatientWorkspace('programs-form-workspace')}
        />
      )}
      {activePatientEnrollment.map((enrollment) => (
        <Tag
          onClick={(e) => {
            onProgramUuidChange(enrollment.program.uuid);
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
