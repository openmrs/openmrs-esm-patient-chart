import React from 'react';
import { useTranslation } from 'react-i18next';
import BiometricsBase from './biometrics-base.component';

interface BiometricsProps {
  patientUuid: string;
  basePath: string;
}

const BiometricsOverview: React.FC<BiometricsProps> = ({ patientUuid, basePath }) => {
  const { t } = useTranslation();
  const pageSize = 5;
  const pageUrl = `\${openmrsSpaBase}/patient/${patientUuid}/chart/Vitals & Biometrics`;
  const urlLabel = t('seeAll', 'See all');

  return <BiometricsBase patientUuid={patientUuid} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />;
};

export default BiometricsOverview;
