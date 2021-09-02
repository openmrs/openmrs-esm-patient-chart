import React, { FunctionComponent } from 'react';
import Forms from './forms.component';
import { useTranslation } from 'react-i18next';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const FormsSummaryDashboard: FunctionComponent<FormsProps> = ({ patientUuid, patient }) => {
  const pageSize: number = 5;
  const { t } = useTranslation();
  const urlLabel: string = t('seeAll', 'See all');
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/forms`;

  return (
    <Forms patientUuid={patientUuid} patient={patient} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />
  );
};

export default FormsSummaryDashboard;
