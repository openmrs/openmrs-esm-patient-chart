import React from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2, useConfig, VisitSummary } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig } from '../../config-schema';
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
  const { notesConceptUuids, drugOrderTypeUUID, disableEmptyTabs } = useConfig<ChartConfig>();
  const { patientUuid: storePatientUuid, visitContext } = usePatientChartStore(patientUuid);

  if (patientUuid !== storePatientUuid) {
    return null;
  }

  if (!visitContext) {
    return (
      <EmptyState
        headerTitle={t('currentVisit', 'Current visit')}
        displayText={t('noActiveVisitMessage', 'active visits')}
        launchForm={() =>
          launchWorkspace2('start-visit-workspace-form', { openedFrom: 'patient-chart-current-visit-summary' })
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('currentVisit', 'Current visit')}>
        <span />
      </CardHeader>
      <div className={styles.visitSummaryCard}>
        <VisitSummary
          visit={visitContext}
          patientUuid={patientUuid}
          notesConceptUuids={notesConceptUuids}
          drugOrderTypeUUID={drugOrderTypeUUID}
          disableEmptyTabs={disableEmptyTabs}
        />
      </div>
    </div>
  );
};

export default CurrentVisitSummary;
