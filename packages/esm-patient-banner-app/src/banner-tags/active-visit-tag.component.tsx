import React from 'react';
import styles from './active-visit-tag.scss';
import { useTranslation } from 'react-i18next';
import { Tag, TooltipDefinition } from 'carbon-components-react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
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
      <TooltipDefinition
        align="end"
        tooltipText={
          <div className={styles.tooltipPadding}>
            <h6 style={{ marginBottom: '0.5rem' }}>{currentVisit?.visitType?.name}</h6>
            <span>
              <span className={styles.tooltipSmallText}>{t('started', 'Started')}: </span>
              <span>{formatDatetime(parseDate(currentVisit?.startDatetime), { mode: 'wide' })}</span>
            </span>
          </div>
        }
      >
        <Tag type="blue">{t('activeVisit', 'Active Visit')}</Tag>
      </TooltipDefinition>
    )
  );
};

export default ActiveVisitBannerTag;
