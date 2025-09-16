import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-tile.scss';

interface AllergyTileProps {
  patientUuid: string;
}

const AllergyTile: React.FC<AllergyTileProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies, isLoading } = useAllergies(patientUuid);

  if (isLoading) {
    return <InlineLoading role="progressbar" description={`${t('loading', 'Loading')} ...`} />;
  }
  if (allergies?.length) {
    return (
      <div>
        <p className={styles.label}>{t('allergies', 'Allergies')}</p>
        <p className={styles.content}>
          <span className={styles.value}>{allergies?.map((allergy) => allergy?.display).join(', ')}</span>
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className={styles.label}>{t('allergies', 'Allergies')}</p>
      <p className={styles.content}>--</p>
    </div>
  );
};

export default AllergyTile;
