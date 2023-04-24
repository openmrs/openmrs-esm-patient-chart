import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, DefinitionTooltip } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useOmrsRestPatient } from '../hooks/usePatientAttributes';
import styles from './deceased-patient-tag.scss';

interface DeceasedPatientBannerTagProps {
  patient: Pick<fhir.Patient, 'deceasedDateTime'>;
  patientUuid: string;
}
const DeceasedPatientBannerTag: React.FC<DeceasedPatientBannerTagProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const { person } = useOmrsRestPatient(patientUuid);

  const isDeceased = person?.dead || patient.deceasedDateTime;

  return (
    isDeceased && (
      <DefinitionTooltip
        align="bottom-left"
        definition={
          <div role="tooltip" className={styles.tooltipPadding}>
            <h6 style={{ marginBottom: '0.5rem' }}>{t('deceased', 'Deceased')}</h6>
            <span>{formatDatetime(parseDate(patient.deceasedDateTime))}</span>
          </div>
        }
      >
        <Tag className={styles.tagOverride}>{t('deceased', 'Deceased')}</Tag>
      </DefinitionTooltip>
    )
  );
};

export default DeceasedPatientBannerTag;
