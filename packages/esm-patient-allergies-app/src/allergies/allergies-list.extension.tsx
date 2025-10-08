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
      <div>
        {t('allergies', 'Allergies')}:
        {allergies.map((allergy) => (
          <Toggletip align="bottom" key={allergy.id}>
            <ToggletipButton label={t('allergies', 'Allergies')}>
              <Tag className={styles.allergyLabel} data-severity={allergy.reactionSeverity?.toLowerCase()}>
                {allergy.reactionToSubstance}
              </Tag>
            </ToggletipButton>
            <ToggletipContent>
              <div role="tooltip">
                <span> {t('severity', 'Severity')}: </span>
                <span>{allergy.reactionSeverity}</span>
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
