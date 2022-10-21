import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, DefinitionTooltip } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import styles from './deceased-patient-tag.scss';

interface DeceasedPatientBannerTagProps {
  patient: Pick<fhir.Patient, 'deceasedDateTime'>;
}
const DeceasedPatientBannerTag: React.FC<DeceasedPatientBannerTagProps> = ({ patient }) => {
  const { t } = useTranslation();
  return patient.deceasedDateTime ? (
    <DefinitionTooltip
      align="bottom-left"
      definition={
        <div role="tooltip" className={styles.tooltipPadding}>
          <h6 style={{ marginBottom: '0.5rem' }}>{t('deceased', 'Deceased')}</h6>
          <span>{formatDatetime(parseDate(patient.deceasedDateTime))}</span>
        </div>
      }
    >
      <Tag type="red">{t('deceased', 'Deceased')}</Tag>
    </DefinitionTooltip>
  ) : null;
};

export default DeceasedPatientBannerTag;
