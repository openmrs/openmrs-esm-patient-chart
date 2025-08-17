import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { useImmunizations } from '../hooks/useImmunizations';
import ImmunizationHistoryCard from './immunization-history-card.component';
import styles from './immunization-history-card.scss';

interface ImmunizationHistoryDashboardProps {
  patientUuid: string;
}

const ImmunizationHistoryDashboard: React.FC<ImmunizationHistoryDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, error } = useImmunizations(patientUuid);
  const headerTitle = t('immunizationsHistory', 'Immunizations history');

  if (data?.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>{null}</CardHeader>
        <div className={styles.content}>
          <ImmunizationHistoryCard error={error} immunizations={data} />
        </div>
      </div>
    );
  }

  return null;
};

export default ImmunizationHistoryDashboard;
