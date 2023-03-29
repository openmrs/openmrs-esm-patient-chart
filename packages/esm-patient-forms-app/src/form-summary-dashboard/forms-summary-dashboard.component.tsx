import React from 'react';
import { useTranslation } from 'react-i18next';
import { useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';
import Forms from '../form/forms.component';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsSummaryDashboard: React.FC<FormsProps> = ({ patientUuid, patient, isOffline }) => {
  const pageSize: number = 5;
  const { t } = useTranslation();
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const urlLabel: string = t('seeAll', 'See all');
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/Forms & Notes`;

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

export default FormsSummaryDashboard;
