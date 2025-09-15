import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-tile.scss';

interface AllergyListInterface {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies, isLoading } = useAllergies(patientUuid);

  if (isLoading) {
    return <InlineLoading role="progressbar" description={`${t('loading', 'Loading')} ...`} />;
  }
  return (
    <div>
      <div className={styles.label}>
        {t('allergies', 'Allergies')}:
        {!allergies ? (
          ' Unknown'
        ) : (
          <span className={styles.content}>
            <span className={styles.value}>{allergies?.map((allergy) => allergy?.display).join(', ')}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AllergyList;
