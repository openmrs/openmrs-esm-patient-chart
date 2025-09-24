import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TagSkeleton } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-list.scss';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies, isLoading } = useAllergies(patientUuid);

  if (isLoading) {
    return <TagSkeleton />;
  }

  if (allergies?.length) {
    return (
      <div className={styles.label}>
        {t('allergies', 'Allergies')}:
        {allergies.map((allergy) => (
          <Tag key={allergy.id} type="red">
            {allergy.reactionToSubstance}
          </Tag>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.label}>
      {t('allergies', 'Allergies')}: {t('unknown', 'Unknown')}
    </div>
  );
};

export default AllergyList;
