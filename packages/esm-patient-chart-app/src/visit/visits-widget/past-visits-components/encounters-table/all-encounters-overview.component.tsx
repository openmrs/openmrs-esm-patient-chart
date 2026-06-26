import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import AllEncountersTable from './all-encounters-table.component';
import styles from './encounter-overview.scss';

interface EncounterOverviewProps {
  patientUuid: string;
}

const EncounterOverview: React.FC<EncounterOverviewProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('allEncounters', 'Encounters');
  return (
    <div>
      <CardHeader title={headerTitle}>
        <span />
      </CardHeader>
      <div className={styles.tableWrapper}>
        <AllEncountersTable patientUuid={patientUuid} />
      </div>
    </div>
  );
};

export default EncounterOverview;
