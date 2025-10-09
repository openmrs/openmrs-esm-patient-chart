import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TagSkeleton, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
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
        <span>{t('allergies', 'Allergies')}:</span>
        {allergies.map((allergy) => (
          <Toggletip align="bottom" key={allergy.id}>
            <ToggletipButton label={`${allergy.reactionToSubstance} - ${t('allergies', 'Allergies')}`}>
              <Tag className={styles.allergyLabel} data-severity={allergy.reactionSeverity?.toLowerCase()}>
                {allergy.reactionToSubstance}
              </Tag>
            </ToggletipButton>
            <ToggletipContent>
              <div>
                <span>{allergy.reactionSeverity || t('unknown', 'Unknown')}</span>
              </div>
            </ToggletipContent>
          </Toggletip>
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
