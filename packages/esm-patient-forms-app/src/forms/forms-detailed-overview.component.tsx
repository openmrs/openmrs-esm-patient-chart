import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';
import Forms from './forms.component';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsDetailedOverView: React.FC<FormsProps> = ({ patientUuid, patient, isOffline }) => {
  const pageSize: number = 10;
  const { t } = useTranslation();
  const urlLabel: string = t('goToSummary', 'Go to Summary');
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/summary`;
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);

  return (
    <>
      <Forms
        patientUuid={patientUuid}
        patient={patient}
        pageSize={pageSize}
        urlLabel={urlLabel}
        pageUrl={pageUrl}
        isOffline={isOffline}
        activePatientEnrollment={activePatientEnrollment}
      />
    </>
  );
};

export default FormsDetailedOverView;
