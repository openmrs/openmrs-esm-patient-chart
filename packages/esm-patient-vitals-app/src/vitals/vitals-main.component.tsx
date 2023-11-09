import React from 'react';
import { useTranslation } from 'react-i18next';
import VitalsOverview from './vitals-overview.component';

interface VitalsMainProps {
  patientUuid: string;
}

const VitalsMain: React.FC<VitalsMainProps> = ({ patientUuid }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');

  return <VitalsOverview patientUuid={patientUuid} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />;
};

export default VitalsMain;
