import React from 'react';
import Forms from './forms.component';
import { useTranslation } from 'react-i18next';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormsDetailedOverView: React.FC<FormsProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const pageSize = 10;
  const urlLabel = t('goToSummary', 'Go to Summary');
  const pageUrl = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/summary`;

  return (
    <Forms patientUuid={patientUuid} patient={patient} pageSize={pageSize} pageUrl={pageUrl} urlLabel={urlLabel} />
  );
};

export default FormsDetailedOverView;
