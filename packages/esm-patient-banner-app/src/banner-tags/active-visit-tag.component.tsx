import React from 'react';
import { useTranslation } from 'react-i18next';
import { DefinitionTooltip, Tag } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import styles from './active-visit-tag.scss';

interface ActiveVisitBannerTagProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const ActiveVisitBannerTag: React.FC<ActiveVisitBannerTagProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const deceasedBoolean = patient.deceasedDateTime ? false : true;
  return (
    currentVisit &&
    deceasedBoolean && (
      <DefinitionTooltip
        align="bottom-left"
        definition={
          <div role="tooltip" className={styles.tooltipPadding}>
            <h6 className={styles.heading}>{currentVisit?.visitType?.name}</h6>
            <span>
              <span className={styles.tooltipSmallText}>{t('started', 'Started')}: </span>
              <span>{formatDatetime(parseDate(currentVisit?.startDatetime), { mode: 'wide' })}</span>
            </span>
          </div>
        }
      >
        <Tag type="blue">{t('activeVisit', 'Active Visit')}</Tag>
      </DefinitionTooltip>
    )
  );
};

export default ActiveVisitBannerTag;
