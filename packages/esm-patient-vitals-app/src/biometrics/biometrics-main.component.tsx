import React from 'react';
import { useTranslation } from 'react-i18next';
import BiometricsBase from './biometrics-base.component';

interface BiometricsProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const BiometricsMain: React.FC<BiometricsProps> = ({ patientUuid, patient }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');

  return (
    <BiometricsBase
      patientUuid={patientUuid}
      patient={patient}
      pageSize={pageSize}
      urlLabel={urlLabel}
      pageUrl={pageUrl}
    />
  );
};

export default BiometricsMain;
