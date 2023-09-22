import React from 'react';
import VisitSummary from './past-visits-components/visit-summary.component';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { CardHeader, EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './current-visit-summary.scss';
import { useVisits } from './visit.resource';

interface CurrentVisitSummaryProps {
  patientUuid: string;
}

const CurrentVisitSummary: React.FC<CurrentVisitSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { visits, isLoading, isValidating, isError } = useVisits(patientUuid);

  const [currentVisit] = visits?.filter((visit) => visit.stopDatetime === null) ?? [];

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loading', 'Loading')}
        description={t('loadingVisit', 'Loading current visit...')}
      />
    );
  }

  if (isError) {
    return <ErrorState headerTitle={t('failedToLoadCurrentVisit', 'Failed loading current visit')} error={isError} />;
  }

  if (!Boolean(currentVisit)) {
    return (
      <EmptyState
        headerTitle={t('currentVisit', 'currentVisit')}
        displayText={t('noActiveVisitMessage', 'active visit')}
        launchForm={() => launchPatientWorkspace('start-visit-workspace-form')}
      />
    );
  }

  return (
    <div className={styles.container}>
      <CardHeader title={t('currentVisit', 'Current Visit')}>
        <span>{isValidating ? <InlineLoading /> : null}</span>
      </CardHeader>
      <div className={styles.visitSummaryCard}>
        <VisitSummary visit={currentVisit} patientUuid={patientUuid} />
      </div>
    </div>
  );
};

export default CurrentVisitSummary;
