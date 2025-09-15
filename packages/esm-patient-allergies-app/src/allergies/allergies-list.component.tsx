import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Tag } from '@carbon/react';
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
  if (allergies?.length) {
    return (
      <div>
        <div className={styles.label}>
          {t('allergies', 'Allergies')}:
          {allergies.map((allergy) => (
            <Tag className={styles.allergiesTag}>{allergy.reactionToSubstance}</Tag>
          ))}
        </div>
      </div>
    );
  } else {
    return <div className={styles.label}>{t('allergies', 'Allergies')}: Unknown</div>;
  }
};

export default AllergyList;
