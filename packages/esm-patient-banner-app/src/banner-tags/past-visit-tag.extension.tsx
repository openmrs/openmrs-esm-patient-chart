import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { type Visit, formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { useIsInPastVisitContext } from '../hooks/useIsInPastVisitContext';
import styles from './past-visit-tag.scss';

interface PastVisitTagProps {
  patientUuid: string;
}

function PastVisitTag({ patientUuid }: PastVisitTagProps) {
  const isInPastVisitContext = useIsInPastVisitContext(patientUuid);
  const { visitContext } = usePatientChartStore(patientUuid);

  return isInPastVisitContext ? <PastVisitTagContent visitContext={visitContext} /> : null;
}

interface PastVisitTagContentProps {
  visitContext: Visit;
}

const PastVisitTagContent: React.FC<PastVisitTagContentProps> = ({ visitContext }) => {
  const { t } = useTranslation();
  const formattedVisitDate = formatDate(parseDate(visitContext.stopDatetime), { mode: 'standard', time: false });
  const label = t('pastVisitWithDate', 'Past visit: {{date}}', { date: formattedVisitDate });

  return (
    <Toggletip align="bottom">
      <ToggletipButton label={label}>
        <Tag className={styles.pastVisitTag}>{label}</Tag>
      </ToggletipButton>
      <ToggletipContent>
        <div role="tooltip">
          <h6 className={styles.heading}>{visitContext?.visitType?.display}</h6>
          <span>
            <span className={styles.tooltipSmallText}>{t('started', 'Started')}: </span>
            <span>{formatDatetime(parseDate(visitContext?.startDatetime), { mode: 'wide' })}</span>
          </span>
        </div>
      </ToggletipContent>
    </Toggletip>
  );
};

export { PastVisitTagProps };
export default PastVisitTag;
