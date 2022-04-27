import React, { FunctionComponent } from 'react';
import Forms from './forms.component';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from 'carbon-components-react';
import { useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsSummaryDashboard: FunctionComponent<FormsProps> = ({ patientUuid, patient, isOffline }) => {
  const pageSize: number = 5;
  const { t } = useTranslation();
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const urlLabel: string = t('seeAll', 'See all');
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/forms`;

  return (
    <>
      {isLoading ? (
        <InlineLoading description={t('loading', 'Loading...')} />
      ) : (
        <Forms
          patientUuid={patientUuid}
          patient={patient}
          pageSize={pageSize}
          urlLabel={urlLabel}
          pageUrl={pageUrl}
          isOffline={isOffline}
          activePatientEnrollment={activePatientEnrollment}
        />
      )}
    </>
  );
};

export default FormsSummaryDashboard;
