import React, { FunctionComponent } from 'react';
import Forms from './forms-see-all';
import { useTranslation } from 'react-i18next';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormsSeeAll: FunctionComponent<FormsProps> = ({ patientUuid, patient }) => {
  const pageSize: number = 10;
  const { t } = useTranslation();
  const urlLabel: string = t('goToSummary', 'Go to Summary');
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/summary`;

  return (
    <Forms patientUuid={patientUuid} patient={patient} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
  );
};

export default FormsSeeAll;
