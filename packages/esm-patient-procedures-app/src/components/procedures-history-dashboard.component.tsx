import { CardHeader } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProceduresHistoryDashboardProps {
  patientUuid: string;
}

const ProceduresHistoryDashboard: React.FC<ProceduresHistoryDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('ProceduresHistory', 'Procedures history');

  return (
    <div>
      <CardHeader title={headerTitle}>{null}</CardHeader>
    </div>
  );
};

export default ProceduresHistoryDashboard;
