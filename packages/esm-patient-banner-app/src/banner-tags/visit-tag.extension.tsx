import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { type Visit, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import styles from './visit-tag.scss';

interface VisitTagProps {
  patientUuid: string;
  patient: fhir.Patient;
}

function VisitTag({ patientUuid, patient }: VisitTagProps) {
  const { activeVisit, isLoading } = useVisitOrOfflineVisit(patientUuid);
  const isNotDeceased = !patient?.deceasedDateTime;
  return !isLoading && activeVisit && isNotDeceased ? <ActiveVisitTag activeVisit={activeVisit} /> : null;
}

interface ActiveVisitTagProps {
  activeVisit: Visit;
}

const ActiveVisitTag: React.FC<ActiveVisitTagProps> = ({ activeVisit }) => {
  const { t } = useTranslation();
  return (
    <Toggletip align="bottom">
      <ToggletipButton label={t('activeVisit', 'Active Visit')}>
        <Tag type="blue">{t('activeVisit', 'Active Visit')}</Tag>
      </ToggletipButton>
      <ToggletipContent>
        <div role="tooltip">
          <h6 className={styles.heading}>{activeVisit?.visitType?.display}</h6>
          <span>
            <span className={styles.tooltipSmallText}>{t('started', 'Started')}: </span>
            <span>{formatDatetime(parseDate(activeVisit?.startDatetime), { mode: 'wide' })}</span>
          </span>
        </div>
      </ToggletipContent>
    </Toggletip>
  );
};

export { VisitTagProps };
export default VisitTag;
