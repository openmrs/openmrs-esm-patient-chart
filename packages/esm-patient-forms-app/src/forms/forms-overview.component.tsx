import React, { FunctionComponent } from 'react';
import Forms from './forms.component';
import { useTranslation } from 'react-i18next';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormsSummaryDashboard: FunctionComponent<FormsProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const pageSize: number = 5;
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/forms`;

  return (
    <Forms patientUuid={patientUuid} patient={patient} pageSize={pageSize} pageUrl={pageUrl} urlLabel={urlLabel} />
  );
};

export default FormsSummaryDashboard;
