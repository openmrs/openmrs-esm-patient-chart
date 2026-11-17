import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { type ImmunizationConfigObject } from '../config-schema';
import { useImmunizations } from '../hooks/useImmunizations';
import { linkConfiguredSequences } from './utils';
import ImmunizationHistoryCard from './immunization-history-card.component';
import styles from './immunization-history-card.scss';

interface ImmunizationHistoryDashboardProps {
  patientUuid: string;
}

const ImmunizationHistoryDashboard: React.FC<ImmunizationHistoryDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { sequenceDefinitions } = useConfig<ImmunizationConfigObject>();
  const { data, error } = useImmunizations(patientUuid);
  const headerTitle = t('immunizationsHistory', 'Immunizations history');

  const immunizations = useMemo(() => linkConfiguredSequences(data, sequenceDefinitions), [data, sequenceDefinitions]);

  // Return null when empty to avoid duplicate empty states.
  // The main ImmunizationsDetailedSummary widget will show the empty state instead.
  if (!data?.length) {
    return null;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>{null}</CardHeader>
      <div className={styles.content}>
        <ImmunizationHistoryCard error={error} immunizations={immunizations} />
      </div>
    </div>
  );
};

export default ImmunizationHistoryDashboard;
