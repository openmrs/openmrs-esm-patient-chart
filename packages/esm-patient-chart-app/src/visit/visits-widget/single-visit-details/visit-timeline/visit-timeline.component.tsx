import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-timeline.scss';
import { useEncountersByVisit } from '../../../../clinical-views/hooks/useEncountersByVisit';
import { formatDate } from '@openmrs/esm-framework';
import { SkeletonText } from '@carbon/react';

interface VisitTimelineProps {
  patientUuid: string;
  visitUuid: string;
}

function VisitTimeline({ patientUuid, visitUuid }: VisitTimelineProps) {
  const { t } = useTranslation();
  const { encounters, isLoading } = useEncountersByVisit(patientUuid, visitUuid);

  if (isLoading) {
    return (
      <div className={styles.visitTimeline}>
        <CardHeader title={t('timeline', 'Timeline')}>
          <></>
        </CardHeader>
        <p className={styles.timelineHeader}>
          <span>{t('encounter', 'Encounter')}</span> <span>&middot;</span>
          <span>{t('provider', 'Provider')}</span> <span>&middot;</span>{' '}
          <span>
            {t('timeStarted', 'Time Started')} <span>&mdash;</span> {t('timeCompleted', 'Time Completed')}{' '}
          </span>
        </p>
        <div className={styles.timelineEntries}>
          {Array.from({ length: 3 }).map((_, index) => (
            <p className={styles.timelineEntry} key={index}>
              <div className={styles.timelineDot} />
              <SkeletonText className={styles.skeleton} />
              <span>&middot;</span>
              <SkeletonText className={styles.skeleton} />
              <span>&middot;</span>
              <SkeletonText className={styles.skeleton} />
              <span>&mdash;</span>
              <SkeletonText className={styles.skeleton} />
            </p>
          ))}
          <div className={styles.timelineLine} />
        </div>
      </div>
    );
  }

  if (encounters?.length === 0) {
    return (
      <EmptyState
        displayText={t('noEncounters', 'encounters for specified visit')}
        headerTitle={t('timeline', 'Timeline')}
      />
    );
  }

  return (
    <div className={styles.visitTimeline}>
      <CardHeader title={t('timeline', 'Timeline')}>
        <></>
      </CardHeader>
      <p className={styles.timelineHeader}>
        <span>{t('encounter', 'Encounter')}</span> <span>&middot;</span>
        <span>{t('provider', 'Provider')}</span> <span>&middot;</span>{' '}
        <span>
          {t('timeStarted', 'Time Started')} <span>&mdash;</span> {t('timeCompleted', 'Time Completed')}{' '}
        </span>
      </p>
      <div className={styles.timelineEntries}>
        {encounters?.map((encounter) => (
          <p className={styles.timelineEntry} key={encounter.uuid}>
            <div className={styles.timelineDot} />
            <span className={styles.encounterType}>{encounter.encounterType.name}</span>
            <span>&middot;</span>
            {encounter.encounterProviders.length === 0 ? (
              <span>{t('noProvider', 'No Provider')}</span>
            ) : (
              <span>
                {/* @ts-ignore temporarily */}
                {encounter.encounterProviders.map((provider) => provider.provider.display).join(', ')}
              </span>
            )}
            <span>&middot;</span>{' '}
            <span>
              {formatDate(new Date(encounter.auditInfo?.dateCreated))} <span>&mdash;</span>{' '}
              {formatDate(new Date(encounter.encounterDatetime))}
            </span>
          </p>
        ))}
        <div className={styles.timelineLine} />
      </div>
    </div>
  );
}

export default VisitTimeline;
