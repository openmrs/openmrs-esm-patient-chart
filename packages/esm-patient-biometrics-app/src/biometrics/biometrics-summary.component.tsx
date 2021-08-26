import React from 'react';
import { useTranslation } from 'react-i18next';
import BiometricsBase from './biometrics-base.component';

interface BiometricsProps {
  patientUuid: string;
  showAddBiometrics: boolean;
  basePath: string;
}

const BiometricsSummary: React.FC<BiometricsProps> = ({ patientUuid, showAddBiometrics, basePath }) => {
  const pageSize = 5;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/vitalsAndBiometrics/biometrics';
  const urlLabel = t('seeAll', 'See all');

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

export default BiometricsSummary;
