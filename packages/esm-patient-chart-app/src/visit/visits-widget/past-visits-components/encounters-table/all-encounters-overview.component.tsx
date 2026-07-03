import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import CompletedFormsTable from './completed-forms-table.component';
import { useConfig } from '@openmrs/esm-framework';
import type { ChartConfig } from '../../../../config-schema';
import styles from './encounter-overview.scss';

interface EncounterOverviewProps {
  patientUuid: string;
}

const EncounterOverview: React.FC<EncounterOverviewProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('allobservations', 'Observations');
  const { consultationEncounterTypeUUid } = useConfig<ChartConfig>();
  return (
    <div>
      <CardHeader title={headerTitle}>
        <span />
      </CardHeader>
      <div className={styles.tableWrapper}>
        <CompletedFormsTable patientUuid={patientUuid} isTabActive={true} filter={{uuid: consultationEncounterTypeUUid}} />
      </div>
    </div>
  );
};

export default EncounterOverview;
