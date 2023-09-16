import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-tile.scss';

interface AllergyTileInterface {
  patientUuid: string;
}

const AllergyTile: React.FC<AllergyTileInterface> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies } = useAllergies(patientUuid);

  if (allergies?.length) {
    return (
      <div className={styles.content}>
        {allergies?.map((allergy) => (
          <Tag type="red">{allergy?.display}</Tag>
        ))}
      </div>
    );
  }
};

export default AllergyTile;
