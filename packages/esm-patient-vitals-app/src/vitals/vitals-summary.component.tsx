import React from 'react';
import { useTranslation } from 'react-i18next';
import VitalsOverview from './vitals-overview.component';

interface VitalsOverviewProps {
  patientUuid: string;
  showAddVitals: boolean;
  basePath: string;
}

const VitalsSummary: React.FC<VitalsOverviewProps> = ({ patientUuid, showAddVitals, basePath }) => {
  const pageSize = 5;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/vitalsAndBiometrics/vitals';
  const urlLabel = t('seeAll', 'See all');

  return (
    <VitalsOverview
      patientUuid={patientUuid}
      showAddVitals={showAddVitals}
      pageSize={pageSize}
      urlLabel={urlLabel}
      pageUrl={pageUrl}
    />
  );
};

export default VitalsSummary;
