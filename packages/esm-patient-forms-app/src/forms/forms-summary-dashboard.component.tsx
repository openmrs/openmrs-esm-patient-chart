import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, InlineLoading } from '@carbon/react';
import { useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';
import Forms from './forms.component';

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
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/forms`;

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
