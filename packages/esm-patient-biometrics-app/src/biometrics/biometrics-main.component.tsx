import React from 'react';
import { useTranslation } from 'react-i18next';
import BiometricsBase from './biometrics-base.component';

interface BiometricsProps {
  patientUuid: string;
  showAddBiometrics: boolean;
  basePath: string;
}

const BiometricsMain: React.FC<BiometricsProps> = ({ patientUuid, showAddBiometrics, basePath }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/summary';
  const urlLabel = t('goToSummary', 'Go to Summary');

  return (
    <BiometricsBase
      patientUuid={patientUuid}
      showAddBiometrics={showAddBiometrics}
      pageSize={pageSize}
      urlLabel={urlLabel}
      pageUrl={pageUrl}
    />
  );
};

export default BiometricsMain;
