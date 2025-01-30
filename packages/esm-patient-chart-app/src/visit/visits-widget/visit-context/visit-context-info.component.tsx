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

  if (visit) {
    const isActive = !Boolean(visit.stopDatetime);

    return (
      <>
        {isActive
          ? t('currentActiveVisit', 'Current active visit')
          : t('fromDateToDate', '{{fromDate}} - {{toDate}}', {
              fromDate: formatDate(parseDate(visit.startDatetime), { time: false }),
              toDate: formatDate(parseDate(visit.stopDatetime), { time: false }),
            })}
        <span className={styles.separator}>&middot;</span>
        <Building />
        <span className={styles.visitLocation}>{visit.location.display}</span>
      </>
    );
  } else {
    return <></>;
  }
};

export default VisitContextInfo;
