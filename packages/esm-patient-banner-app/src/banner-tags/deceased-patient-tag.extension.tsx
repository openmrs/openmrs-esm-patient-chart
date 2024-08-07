import React from 'react';
import { useTranslation } from 'react-i18next';
import { DefinitionTooltip, Tag } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useCauseOfDeath } from '../hooks/useCauseOfDeath';
import styles from './deceased-patient-tag.scss';

interface DeceasedPatientBannerTagProps {
  patient: fhir.Patient;
}

const DeceasedPatientBannerTag: React.FC<DeceasedPatientBannerTagProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isDeceased = Boolean(patient?.deceasedDateTime);
  const { causeOfDeath, nonCodedCauseOfDeath } = useCauseOfDeath(patient?.id);

  if (!isDeceased) return null;

  return (
    <DefinitionTooltip
      align="bottom-left"
      definition={
        <div role="tooltip" className={styles.tooltipPadding}>
          <h6 style={{ marginBottom: '0.5rem' }}>{t('deceased', 'Deceased')}</h6>
          <span>
            {formatDatetime(parseDate(patient?.deceasedDateTime))}
            {nonCodedCauseOfDeath || causeOfDeath
              ? ` ${t('from_lower', 'from')} ${nonCodedCauseOfDeath || causeOfDeath}`
              : null}
          </span>
        </div>
      }
    >
      <Tag className={styles.tagOverride}>{t('deceased', 'Deceased')}</Tag>
    </DefinitionTooltip>
  );
};

export { DeceasedPatientBannerTagProps };
export default DeceasedPatientBannerTag;
