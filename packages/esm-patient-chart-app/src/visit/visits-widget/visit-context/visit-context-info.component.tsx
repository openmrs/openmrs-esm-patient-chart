import { Building } from '@carbon/react/icons';
import { formatDate, parseDate, type Visit } from '@openmrs/esm-framework';
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

  return (
    <div className={styles.visitContextInfoContainer}>
      <span>
        {isActive
          ? t('currentActiveVisit', 'Current active visit')
          : t('fromDateToDate', '{{fromDate}} - {{toDate}}', {
              fromDate: formatDate(parseDate(visit.startDatetime), { time: false }),
              toDate: formatDate(parseDate(visit.stopDatetime), { time: false }),
            })}
      </span>
      <span className={styles.separator}>&middot;</span>
      <Building />
      <span className={styles.visitLocation}>{visit.location.display}</span>
    </div>
  );
};

export default VisitContextInfo;
