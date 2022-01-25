import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TooltipDefinition } from 'carbon-components-react';
import styles from './deceased-patient-tag.scss';

interface DeceasedPatientBannerTagProps {
  patient: Pick<fhir.Patient, 'deceasedBoolean'>;
}

const DeceasedPatientBannerTag: React.FC<DeceasedPatientBannerTagProps> = ({ patient }) => {
  const { t } = useTranslation();
  return (
    <>
      {patient?.deceasedBoolean ? (
        <TooltipDefinition
          align="end"
          tooltipText={
            <div className={styles.tooltipPadding}>
              <h6 style={{ marginBottom: '0.5rem' }}>{t('deceased', 'Deceased')}</h6>
            </div>
          }
        >
          <Tag type="red">{t('deceased', 'Deceased')}</Tag>
        </TooltipDefinition>
      ) : null}
    </>
  );
};

export default DeceasedPatientBannerTag;
