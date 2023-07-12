import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Visit, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import styles from './visit-tag.scss';

interface VisitTagProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const VisitTag: React.FC<VisitTagProps> = ({ patientUuid, patient }) => {
  const { currentVisit, isRetrospective } = useVisitOrOfflineVisit(patientUuid);
  const isNotDeceased = !patient.deceasedDateTime;
  return (
    currentVisit &&
    (isRetrospective ? (
      <RetrospectiveEntryTag currentVisit={currentVisit} />
    ) : (
      isNotDeceased && <ActiveVisitTag currentVisit={currentVisit} />
    ))
  );
};

interface ActiveVisitTagProps {
  currentVisit: Visit;
}

const ActiveVisitTag: React.FC<ActiveVisitTagProps> = ({ currentVisit }) => {
  const { t } = useTranslation();
  return (
    <Toggletip align="bottom">
      <ToggletipButton label={t('activeVisit', 'Active Visit')}>
        <Tag type="blue">{t('activeVisit', 'Active Visit')}</Tag>
      </ToggletipButton>
      <ToggletipContent>
        <div role="tooltip">
          <h6 className={styles.heading}>{currentVisit?.visitType?.display}</h6>
          <span>
            <span className={styles.tooltipSmallText}>{t('started', 'Started')}: </span>
            <span>{formatDatetime(parseDate(currentVisit?.startDatetime), { mode: 'wide' })}</span>
          </span>
        </div>
      </ToggletipContent>
    </Toggletip>
  );
};

interface RetrospectiveEntryTagProps {
  currentVisit: Visit;
}

const RetrospectiveEntryTag: React.FC<RetrospectiveEntryTagProps> = ({ currentVisit }) => {
  const { t } = useTranslation();
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

export default VisitTag;
