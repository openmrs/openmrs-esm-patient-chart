import React from 'react';
import { useAllergies } from './allergy-intolerance.resource';
import { useTranslation } from 'react-i18next';
import styles from './allergies-tile.component.scss';

interface AllergyTileInterface {
  patientUuid: string;
}

const AllergyTile: React.FC<AllergyTileInterface> = ({ patientUuid }) => {
  const { data: allergies } = useAllergies(patientUuid);
  const { t } = useTranslation();

  return (
    <div className={styles.gridColumn}>
      <p>{t('allergies', 'Allergies')}</p>
      <span>{allergies?.map((allergy) => allergy.display).join(', ')}</span>
    </div>
  );
};

export default AllergyTile;
