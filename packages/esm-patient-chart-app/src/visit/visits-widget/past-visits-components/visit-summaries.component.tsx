import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import VisitSummary from './visit-summary.component';
import styles from './visit-summaries.scss';
import { useInfiniteVisits } from '../visit.resource';

interface Props {
  patientUuid: string;
}

const VisitSummaries: React.FC<Props> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { visits, error, isLoading, mutate: mutateVisits } = useInfiniteVisits(patientUuid);
  if (isLoading) {
    return <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />;
  }
  if (error) {
    return <ErrorState headerTitle={t('pastVisits', 'Past visits')} error={error} />;
  }
  if (visits.length == 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState headerTitle={t('pastVisits', 'Past visits')} displayText={t('visits', 'visits')} />
      </div>
    );
  }

  return (
    <>
      {visits.map((visit) => (
        <div className={styles.container} key={visit.uuid}>
          <div className={styles.header}>
            <div className={styles.visitInfo}>
              <div>
                <h4 className={styles.visitType}>{visit?.visitType?.display}</h4>
                <div className={styles.displayFlex}>
                  <h6 className={styles.dateLabel}>{t('start', 'Start')}:</h6>
                  <span className={styles.date}>{formatDatetime(parseDate(visit?.startDatetime))}</span>
                  {visit?.stopDatetime ? (
                    <>
                      <h6 className={styles.dateLabel}>{t('end', 'End')}:</h6>
                      <span className={styles.date}>{formatDatetime(parseDate(visit?.stopDatetime))}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div>
                <ExtensionSlot
                  name="visit-detail-overview-actions"
                  className={styles.visitDetailOverviewActions}
                  state={{ patientUuid, visit }}
                />
              </div>
            </div>
          </div>
          <VisitSummary visit={visit} patientUuid={patientUuid} mutateVisit={mutateVisits} />
        </div>
      ))}
    </>
  );
};

export default VisitSummaries;
