import { Building } from '@carbon/react/icons';
import { formatDate, formatDatetime, parseDate, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-context-info.scss';

interface VisitContextInfoProps {
  visit: Visit;
}

const VisitContextInfo: React.FC<VisitContextInfoProps> = ({ visit }) => {
  const { t } = useTranslation();

  if (!visit) {
    return null;
  }

  const isActive = !visit.stopDatetime;

  let dateDisplay: string;
  if (isActive) {
    // Active visit: show the start date and time.
    dateDisplay = formatDatetime(parseDate(visit.startDatetime));
  } else {
    // Past visit: show the start date, and the end date only when it falls on a different day.
    const fromDate = formatDate(parseDate(visit.startDatetime), { time: false });
    const toDate = formatDate(parseDate(visit.stopDatetime), { time: false });
    dateDisplay =
      fromDate === toDate ? fromDate : t('fromDateToDate', '{{fromDate}} - {{toDate}}', { fromDate, toDate });
  }

  return (
    <div className={styles.visitContextInfoContainer}>
      <span className={styles.dateRange}>{dateDisplay}</span>
      <span className={styles.locationGroup}>
        <Building />
        <span className={styles.visitLocation}>{visit.location.display}</span>
      </span>
    </div>
  );
};

export default VisitContextInfo;
