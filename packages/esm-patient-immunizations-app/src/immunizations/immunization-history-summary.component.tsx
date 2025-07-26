import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

import styles from './immunization-history-card.scss';
import { useImmunizations } from '../hooks/useImmunizations';
import ImmunizationHistoryCard from './immunization-history-card.component';

interface ImmunizationScheduleDashboardProps {
  patientUuid: string;
}

const ImmunizationHistoryDashboard: React.FC<ImmunizationScheduleDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useImmunizations(patientUuid);

  const headerTitle = t('immunizationsHistory', 'Immunizations History');

  if (isLoading) {
    return <DataTableSkeleton columnCount={2} rowCount={5} showHeader zebra />;
  }

  if (data?.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle} children={''} />
        <div className={styles.content}>
          <ImmunizationHistoryCard patientUuid={patientUuid} />
        </div>
      </div>
    );
  }

  return null;
};

export default ImmunizationHistoryDashboard;
