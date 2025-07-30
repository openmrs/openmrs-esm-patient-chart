import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import ImmunizationHistoryCard from './immunization-history-card.component';
import { useImmunizations } from '../hooks/useImmunizations';
import styles from './immunization-history-card.scss';

interface ImmunizationHistoryDashboardProps {
  patientUuid: string;
}

const ImmunizationHistoryDashboard: React.FC<ImmunizationHistoryDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: immunizations, error, isLoading } = useImmunizations(patientUuid);

  const headerTitle = t('immunizationsHistory', 'Immunizations history');

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <DataTableSkeleton role="progressbar" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (immunizations?.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>{null}</CardHeader>
        <div className={styles.content}>
          <ImmunizationHistoryCard immunizations={immunizations} />
        </div>
      </div>
    );
  }

  return null;
};

export default ImmunizationHistoryDashboard;
