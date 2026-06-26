import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import VisitHistoryTable from './visit-history-table.component';
import styles from './visit-overview.scss';

interface VisitHistoryOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const VisitHistoryOverview: React.FC<VisitHistoryOverviewProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const headerTitle = t('visitsTitle', 'Visits');
  return (
    <div>
      <CardHeader title={headerTitle}>
        <span />
      </CardHeader>
      <div className={styles.tableWrapper}>
        <VisitHistoryTable patientUuid={patientUuid} patient={patient} />
      </div>
    </div>
  );
};

export default VisitHistoryOverview;
