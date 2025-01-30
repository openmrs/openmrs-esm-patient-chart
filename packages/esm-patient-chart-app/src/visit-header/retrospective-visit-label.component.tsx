import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toggletip, ToggletipButton, ToggletipContent, Tag } from '@carbon/react';
import { type Visit, formatDatetime, parseDate } from '@openmrs/esm-framework';
import styles from './retrospective-visit-label.scss';

interface RetrospectiveVisitLabelProps {
  currentVisit: Visit;
}

const RetrospectiveVisitLabel: React.FC<RetrospectiveVisitLabelProps> = ({ currentVisit }) => {
  const { t } = useTranslation();
  if (!currentVisit) {
    return <></>;
  }
  return (
    <Toggletip align="bottom">
      <ToggletipButton label={t('retrospectiveEntry', 'Retrospective Entry')}>
        <Tag type="purple">{t('retrospectiveEntry', 'Retrospective Entry')}</Tag>
      </ToggletipButton>
      <ToggletipContent>
        <div role="tooltip">
          <h6 className={styles.heading}>{currentVisit?.visitType?.display}</h6>
          <div>
            <span className={styles.tooltipSmallText}>{t('startDate', 'Start date')}: </span>
            <span>{formatDatetime(parseDate(currentVisit?.startDatetime), { mode: 'wide' })}</span>
          </div>
          <div>
            <span className={styles.tooltipSmallText}>{t('endDate', 'End date')}: </span>
            <span>{formatDatetime(parseDate(currentVisit?.stopDatetime), { mode: 'wide' })}</span>
          </div>
        </div>
      </ToggletipContent>
    </Toggletip>
  );
};

export { RetrospectiveVisitLabelProps };
export default RetrospectiveVisitLabel;
