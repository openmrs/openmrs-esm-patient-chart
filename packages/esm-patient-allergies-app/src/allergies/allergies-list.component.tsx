import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Tag } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-tile.scss';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
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
            <Tag className={styles.allergiesTag} key={allergy.id}>
              {allergy.reactionToSubstance}
            </Tag>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.label}>
        {t('allergies', 'Allergies')}: {t('unknown', 'Unknown')}
      </div>
    );
  }
};

export default AllergyList;
