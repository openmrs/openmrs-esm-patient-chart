import React from 'react';
import styles from './active-visit-tag.scss';
import { useTranslation } from 'react-i18next';
import { Tag, TooltipDefinition } from 'carbon-components-react';

interface DecasedBannerTagProps {
  patientUuid: string;
  patient: fhir.Patient;
}
const DeceasedBannerTag: React.FC<DecasedBannerTagProps> = ({ patient }) => {
  const { t } = useTranslation();
  return (
    patient.deceasedBoolean && (
      <TooltipDefinition
        align="end"
        tooltipText={
          <div className={styles.tooltipPadding}>
            <h6 style={{ marginBottom: '0.5rem' }}>deceased</h6>
          </div>
        }
      >
        <Tag type="red">{t('deceased', 'Deceased')}</Tag>
      </TooltipDefinition>
    )
  );
};

export default DeceasedBannerTag;
