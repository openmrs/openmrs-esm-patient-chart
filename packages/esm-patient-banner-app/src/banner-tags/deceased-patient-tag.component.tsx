import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TooltipDefinition } from 'carbon-components-react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import styles from './deceased-patient-tag.scss';

interface DeceasedPatientBannerTagProps {
  patient: Pick<fhir.Patient, 'deceasedDateTime'>;
}
const DeceasedPatientBannerTag: React.FC<DeceasedPatientBannerTagProps> = ({ patient }) => {
  const { t } = useTranslation();
  return patient.deceasedDateTime ? (
    <TooltipDefinition
      align="end"
      tooltipText={
        <div className={styles.tooltipPadding}>
          <h6 style={{ marginBottom: '0.5rem' }}>{t('deceased', 'Deceased')}</h6>
          <span>{formatDatetime(parseDate(patient.deceasedDateTime))}</span>
        </div>
      }
    >
      <Tag type="red">{t('deceased', 'Deceased')}</Tag>
    </TooltipDefinition>
  ) : null;
};

export default DeceasedPatientBannerTag;
