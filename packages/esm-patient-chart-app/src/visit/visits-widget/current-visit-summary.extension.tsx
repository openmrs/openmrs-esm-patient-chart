import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, EmptyState, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { launchStartVisitWorkspace } from '../visit-form/launch-start-visit-workspace';
import VisitSummary from './past-visits-components/visit-summary.component';
import styles from './current-visit-summary.scss';

interface CurrentVisitSummaryProps {
  patientUuid: string;
}

/**
 * This extension is not used in the refapp.
 * This extension uses the patient chart store and SHOULD only be mounted within the patient chart
 */
const CurrentVisitSummary: React.FC<CurrentVisitSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patientUuid: storePatientUuid, activeVisit } = usePatientChartStore(patientUuid);

  if (patientUuid !== storePatientUuid) {
    return null;
  }

  if (!activeVisit) {
    return (
      <EmptyState
        headerTitle={t('currentVisit', 'Current visit')}
        displayText={t('noActiveVisitMessage', 'active visits')}
        launchForm={() => launchStartVisitWorkspace({ openedFrom: 'patient-chart-current-visit-summary' }, patientUuid)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('currentVisit', 'Current visit')}>
        <span />
      </CardHeader>
      <div className={styles.visitSummaryCard}>
        <VisitSummary visit={activeVisit} patientUuid={patientUuid} />
      </div>
    </div>
  );
};

export default CurrentVisitSummary;
