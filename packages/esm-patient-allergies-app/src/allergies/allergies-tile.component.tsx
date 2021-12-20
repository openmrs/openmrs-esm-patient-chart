import React from 'react';
import { useAllergies } from './allergy-intolerance.resource';
import { useTranslation } from 'react-i18next';
import styles from './allergies-tile.component.scss';

interface AllergyTileInterface {
  patientUuid: string;
}

const AllergyTile: React.FC<AllergyTileInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: allergies } = useAllergies(patientUuid);

  return (
    <div>
      <p className={styles.label}>{t('allergies', 'Allergies')}</p>
      <p className={styles.content}>
        {allergies?.length ? (
          <span className={styles.value}>{allergies?.map((allergy) => allergy.display).join(', ')}</span>
        ) : (
          '--'
        )}
      </p>
    </div>
  );
};

export default AllergyTile;
